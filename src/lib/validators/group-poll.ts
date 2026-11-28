import { z } from 'zod'
import { isIanaZone } from '@/lib/validators/booking'

const zone = z.string().trim().refine(isIanaZone, 'Pick a time zone from the list.')
const id = z.string().trim().min(1).max(64)

/** "2026-12-04" and "19:30", read on `timezone`'s clock. */
const localTime = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Each time needs a date.'),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Each time needs a start time.'),
})

export const createGroupPollSchema = z.object({
  title: z.string().trim().min(1, 'Give it a name.').max(80, 'Keep the name under 80 characters.'),
  note: z.string().trim().max(600, 'Keep the note under 600 characters.').optional().transform(v => v || undefined),
  durationMinutes: z.coerce.number().int().min(15).max(8 * 60),
  timezone: zone,
  meetingUrl: z.string().trim().max(300).url('That link does not look right.').optional().or(z.literal('')).transform(v => v || undefined),
  times: z.array(localTime).min(2, 'Offer at least two times.').max(40, 'Forty times is plenty.'),
})

export type CreateGroupPollInput = z.infer<typeof createGroupPollSchema>

export const addOptionsSchema = z.object({ pollId: id, timezone: zone, times: z.array(localTime).min(1).max(40) })

/**
 * What brings someone to the Claude and Such meetup. Stored by key, so a label can be
 * reworded without losing earlier answers.
 */
export const MEETUP_INTERESTS = [
  { key: 'parallel', label: 'Running lots of Claude Code sessions at once' },
  { key: 'review', label: 'Getting Claude and Codex to check each other’s work' },
  { key: 'agents', label: 'Agents, subagents and workflows' },
  { key: 'tooling', label: 'Skills, hooks and MCP servers' },
  { key: 'shipping', label: 'Shipping real products and client work' },
  { key: 'costs', label: 'Picking models and keeping costs down' },
  { key: 'people', label: 'Meeting others building with Claude' },
  { key: 'demo', label: 'Showing something I’ve built' },
] as const

export const MEETUP_EXPERIENCE = [
  { key: 'curious', label: 'Curious, not using it much yet' },
  { key: 'chat', label: 'Using Claude chat most days' },
  { key: 'code', label: 'Using Claude Code most days' },
  { key: 'agents', label: 'Running many agents or building on the API' },
] as const

const INTEREST_KEYS = new Set<string>(MEETUP_INTERESTS.map(i => i.key))
const EXPERIENCE_KEYS = new Set<string>(MEETUP_EXPERIENCE.map(e => e.key))

export const NOTE_MAX = 500

/**
 * "+61412345678". The group is mostly in Australia, so a local mobile (0412 345 678)
 * or one without its leading 0 (412 345 678) is read as Australian; anything else
 * needs its country code. Null when it cannot be a phone number.
 */
export function normaliseMeetupPhone(raw: string): string | null {
  const trimmed = raw.trim()
  const digits = trimmed.replace(/\D/g, '')
  if (trimmed.startsWith('+')) return /^\d{8,15}$/.test(digits) ? `+${digits}` : null
  if (/^04\d{8}$/.test(digits)) return `+61${digits.slice(1)}`
  if (/^4\d{8}$/.test(digits)) return `+61${digits}`
  return null
}

export const respondSchema = z
  .object({
    slug: z.string().trim().min(1).max(64),
    name: z.string().trim().min(1, 'Please add your name.').max(60, 'That name is a little long.'),
    email: z.string().trim().toLowerCase().max(200, 'Please check the email address.').pipe(z.email('Please check the email address.')),
    phone: z
      .string()
      .trim()
      .max(30, 'Please check the mobile number.')
      .default('')
      .refine(v => v === '' || normaliseMeetupPhone(v) !== null, 'Please check the mobile number. Outside Australia, start with your country code, like +1.')
      .transform(v => (v ? normaliseMeetupPhone(v) : null)),
    interests: z.array(z.string()).max(MEETUP_INTERESTS.length).transform(keys => [...new Set(keys)].filter(k => INTEREST_KEYS.has(k))),
    experience: z.string().optional().transform(v => (v && EXPERIENCE_KEYS.has(v) ? v : null)),
    note: z.string().trim().max(NOTE_MAX, `Keep it under ${NOTE_MAX} characters.`).default('').transform(v => v || null),
    timezone: z.string().trim().max(64).optional().transform(v => (v && isIanaZone(v) ? v : undefined)),
    yes: z.array(id).max(60),
    maybe: z.array(id).max(60),
    website: z.string().max(200).default(''),
    startedAt: z.coerce.number().int(),
  })
  .refine(v => v.yes.length + v.maybe.length > 0, { message: 'Mark at least one time you could make, or “If need be”.', path: ['yes'] })

export type RespondInput = z.infer<typeof respondSchema>

export const pollIdSchema = id
export const chooseOptionSchema = z.object({ pollId: id, optionId: id.nullable() })

/** The cookie that remembers which answers belong to this browser: gp_<slug>. */
export const POLL_COOKIE_PREFIX = 'gp_'
