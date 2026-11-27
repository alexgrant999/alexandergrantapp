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

export const respondSchema = z
  .object({
    slug: z.string().trim().min(1).max(64),
    name: z.string().trim().min(1, 'Please add your name.').max(60, 'That name is a little long.'),
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
