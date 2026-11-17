import { z } from 'zod'

/** The shape of an IANA zone name as a browser reports it, like "America/New_York". */
const TIMEZONE_NAME = /^(UTC|[A-Za-z_]+\/[A-Za-z0-9_/+-]+)$/

/**
 * Whether this server can format dates in `value`. The pattern alone is not
 * enough: Intl throws on a well formed name it does not know ("Mars/Olympus"),
 * and a stored zone like that would break every email for that booking.
 */
export function isIanaZone(value: string): boolean {
  if (!TIMEZONE_NAME.test(value)) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value })
    return true
  } catch {
    return false
  }
}

const instant = z.iso.datetime({ offset: true, message: 'Please pick a time.' })

/** Ad click ids and UTM tags the booking form carries in hidden fields, under exactly these names. */
export const ATTRIBUTION_KEYS = [
  'gclid',
  'gbraid',
  'wbraid',
  'fbclid',
  'msclkid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const

export type AttributionKey = (typeof ATTRIBUTION_KEYS)[number]

/**
 * Optional, at most 200 characters. A longer value is dropped rather than
 * failing the form: it is a hidden field the visitor can neither see nor fix,
 * and a booking matters more than its ad tag.
 */
const attributionValue = z
  .string()
  .trim()
  .optional()
  .transform(value => (value && value.length <= 200 ? value : undefined))

const attributionFields = Object.fromEntries(ATTRIBUTION_KEYS.map(key => [key, attributionValue])) as Record<AttributionKey, typeof attributionValue>

/** "+12125550100". Ten digits with no country code are read as a US number. Null when it cannot be a phone number. */
export function normalisePhone(raw: string): string | null {
  const trimmed = raw.trim()
  const digits = trimmed.replace(/\D/g, '')
  if (trimmed.startsWith('+')) return /^\d{8,15}$/.test(digits) ? `+${digits}` : null
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

/**
 * A visitor booking an intro call. A zone the server cannot read becomes "",
 * which the service reads as Alex's zone: the visitor cannot fix their
 * browser's zone name, so it is not worth failing the form over. `website` is
 * the honeypot; the action acts on it before this schema runs, so a bot never
 * sees a field error for it. Unknown keys are dropped, as zod objects do by default.
 */
export const bookCallSchema = z
  .object({
  name: z.string().trim().min(1, 'Please tell me your name.').max(80, 'Please use a shorter name.'),
  email: z.string().trim().toLowerCase().max(200, 'Please check the email address.').pipe(z.email('Please check the email address.')),
  business: z.string().trim().min(1, 'Please tell me the name of your business.').max(120, 'Please use a shorter business name.'),
  need: z.string().trim().max(600, 'Please keep this under 600 characters.').default(''),
  startsAt: instant,
  timezone: z
    .string()
    .trim()
    .max(64)
    .default('')
    .transform(value => (isIanaZone(value) ? value : '')),
  source: z
    .string()
    .trim()
    .max(100)
    .optional()
    .transform(value => value || undefined),
  website: z.string().max(0).default(''),
  startedAt: z.coerce.number().int().nonnegative(),
  /** Only used when smsConsent is ticked. */
  phone: z.string().trim().max(30, 'Please check the mobile number.').default(''),
  smsConsent: z.boolean().default(false),
  ...attributionFields,
})
  .refine(data => !data.smsConsent || normalisePhone(data.phone) !== null, {
    path: ['phone'],
    message: 'Please add a mobile number with its country code, like +1 212 555 0100.',
  })

export type BookCallInput = z.infer<typeof bookCallSchema>

export const manageTokenSchema = z.string().trim().min(3).max(200)

export const rescheduleSchema = z.object({ token: manageTokenSchema, startsAt: instant })

const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24 hour HH:mm.')
/** A day's hours may end at "24:00" so they can run to the bottom of the day. */
const clockEnd = z.string().regex(/^(([01]\d|2[0-3]):[0-5]\d|24:00)$/, 'Use 24 hour HH:mm.')

const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5))

/** The whole week in one go. Ranges must end after they start and must not overlap on a day; touching is fine. */
export const weeklyHoursSchema = z
  .array(
    z
      .object({ dayOfWeek: z.number().int().min(0).max(6), startTime: clock, endTime: clockEnd })
      .refine(range => toMinutes(range.endTime) > toMinutes(range.startTime), 'Each range must end after it starts.'),
  )
  .max(42, 'That is too many ranges.')
  .refine(hours => {
    const sorted = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek || toMinutes(a.startTime) - toMinutes(b.startTime))
    return sorted.every((range, i) => {
      const prev = sorted[i - 1]
      return !prev || prev.dayOfWeek !== range.dayOfWeek || toMinutes(prev.endTime) <= toMinutes(range.startTime)
    })
  }, 'Two ranges on the same day overlap.')

/** A full ISO instant, or a datetime-local value ("YYYY-MM-DDTHH:mm") which the service reads as Alex's time zone. */
const instantOrLocal = z.union([z.iso.datetime({ offset: true }), z.string().regex(/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/)], {
  message: 'Pick a date and time.',
})

export const timeOffSchema = z.object({
  startsAt: instantOrLocal,
  endsAt: instantOrLocal,
  note: z
    .string()
    .trim()
    .max(200, 'Please keep the note under 200 characters.')
    .optional()
    .transform(value => value || undefined),
})

export type TimeOffInput = z.infer<typeof timeOffSchema>

export const bookingIdSchema = z.string().trim().min(1).max(64)

export const bookingStatusSchema = z.enum(['COMPLETED', 'NO_SHOW', 'CANCELLED'])
