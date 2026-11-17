import { localParts, shiftDate, weekdayOf, zonedTimeToUtc } from '@/lib/time'

/**
 * Weekly hours as instants, and the bookable slots inside them. Pure: no
 * database work, so every rule here can be checked in isolation. Ported from
 * Teddy Calls without appointment kinds, per date hours or calendar sync.
 */

export type RuleLike = { dayOfWeek: number; startTime: string; endTime: string; timezone: string }

/** A window as epoch milliseconds. `zone` is the zone its rule was set in, which the slot step aligns to. */
export type InstantWindow = { start: number; end: number; zone: string }

export type Span = { startsAt: Date; endsAt: Date }

/**
 * Every weekly window that runs into the local dates [fromDate, fromDate + days)
 * read in `timezone`, as instants. Each rule is read in its own zone, so a
 * 10:00 window stays at 10:00 local through a clock change. An end of "24:00"
 * is the next midnight.
 */
export function effectiveWindows(params: { rules: RuleLike[]; timezone: string; fromDate: string; days: number }): InstantWindow[] {
  const { rules, timezone, fromDate, days } = params
  const rangeStart = zonedTimeToUtc(fromDate, '00:00', timezone).getTime()
  const rangeEnd = zonedTimeToUtc(shiftDate(fromDate, days), '00:00', timezone).getTime()

  // A rule's zone can be a day ahead of or behind `timezone`.
  const lookFrom = shiftDate(fromDate, -2)
  const lookTo = shiftDate(fromDate, days + 2)

  const windows: InstantWindow[] = []
  for (const rule of rules) {
    for (let date = lookFrom; date <= lookTo; date = shiftDate(date, 1)) {
      if (weekdayOf(date) !== rule.dayOfWeek) continue
      const start = zonedTimeToUtc(date, rule.startTime, rule.timezone).getTime()
      const end = zonedTimeToUtc(date, rule.endTime, rule.timezone).getTime()
      if (end <= start || start >= rangeEnd || end <= rangeStart) continue
      windows.push({ start, end, zone: rule.timezone })
    }
  }
  return windows.sort((a, b) => a.start - b.start)
}

/** Windows that overlap or touch, as one, so the slot grid runs on across a seam. A merged window keeps the earlier one's zone. */
export function unionWindows(windows: InstantWindow[]): InstantWindow[] {
  const out: InstantWindow[] = []
  for (const window of [...windows].sort((a, b) => a.start - b.start)) {
    const last = out[out.length - 1]
    if (last && window.start <= last.end) last.end = Math.max(last.end, window.end)
    else out.push({ ...window })
  }
  return out
}

/** The first instant at or after `startMs` whose minute of the hour in `zone` is a multiple of `stepMinutes`. */
function alignToStep(startMs: number, zone: string, stepMinutes: number): number {
  const past = localParts(zone, new Date(startMs)).minutesOfDay % stepMinutes
  return past === 0 ? startMs : startMs + (stepMinutes - past) * 60_000
}

/**
 * Slots on each `stepMinutes` boundary inside the weekly windows, on local
 * dates [fromDate, fromDate + days) in `timezone`, each wholly inside a window.
 * Leaves out anything starting before now + leadMinutes, anything within
 * bufferMinutes of an existing booking or a busy block, and every slot on a
 * `timezone` date that already has maxPerDay bookings. Busy blocks (time off
 * today, calendar busy time later) take the same buffer as a booking but do
 * not count toward the day's cap.
 */
export function computeSlots(params: {
  rules: RuleLike[]
  existing: Span[]
  busy?: Span[]
  durationMinutes: number
  bufferMinutes: number
  leadMinutes: number
  stepMinutes: number
  maxPerDay: number
  timezone: string
  now: Date
  fromDate: string
  days: number
}): Span[] {
  const { rules, existing, timezone, fromDate, days, stepMinutes } = params
  const busy = params.busy ?? []
  const durationMs = params.durationMinutes * 60_000
  const bufferMs = params.bufferMinutes * 60_000
  const stepMs = stepMinutes * 60_000
  const earliestStart = params.now.getTime() + params.leadMinutes * 60_000
  const horizonEnd = zonedTimeToUtc(shiftDate(fromDate, days), '00:00', timezone).getTime()

  const perDay = new Map<string, number>()
  for (const booking of existing) {
    const date = localParts(timezone, booking.startsAt).date
    perDay.set(date, (perDay.get(date) ?? 0) + 1)
  }

  const slots: Span[] = []
  for (const window of unionWindows(effectiveWindows({ rules, timezone, fromDate, days }))) {
    for (let start = alignToStep(window.start, window.zone, stepMinutes); start + durationMs <= window.end; start += stepMs) {
      if (start < earliestStart || start >= horizonEnd) continue
      const end = start + durationMs

      if ((perDay.get(localParts(timezone, new Date(start)).date) ?? 0) >= params.maxPerDay) continue
      if (existing.some(b => start < b.endsAt.getTime() + bufferMs && end > b.startsAt.getTime() - bufferMs)) continue
      if (busy.some(b => start < b.endsAt.getTime() + bufferMs && end > b.startsAt.getTime() - bufferMs)) continue

      slots.push({ startsAt: new Date(start), endsAt: new Date(end) })
    }
  }
  return slots.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
}

/**
 * `blocks` with `cut` taken out of each, so a block that straddles it leaves
 * up to two pieces. Used to stop a booking's own calendar event from blocking
 * the booking while it is being moved: freeBusy reports times, not event ids.
 */
export function subtractSpan(blocks: Span[], cut: Span | null): Span[] {
  if (!cut) return blocks
  const cutStart = cut.startsAt.getTime()
  const cutEnd = cut.endsAt.getTime()
  return blocks.flatMap(block => {
    if (block.endsAt.getTime() <= cutStart || block.startsAt.getTime() >= cutEnd) return [block]
    const pieces: Span[] = []
    if (block.startsAt.getTime() < cutStart) pieces.push({ startsAt: block.startsAt, endsAt: cut.startsAt })
    if (block.endsAt.getTime() > cutEnd) pieces.push({ startsAt: cut.endsAt, endsAt: block.endsAt })
    return pieces
  })
}
