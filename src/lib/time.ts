/**
 * Time zone helpers for booking, Intl only. Ported from Teddy Calls.
 * Not to be confused with src/lib/services/time.ts, which is time entries.
 */

type LocalParts = { date: string; minutesOfDay: number; dayOfWeek: number }

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

/** Wall clock date ("YYYY-MM-DD"), minutes past midnight and weekday (0 is Sunday) in `timezone`. */
export function localParts(timezone: string, at: Date = new Date()): LocalParts {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hourCycle: 'h23',
  }).formatToParts(at)

  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ''

  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    minutesOfDay: Number(get('hour')) * 60 + Number(get('minute')),
    dayOfWeek: WEEKDAY_INDEX[get('weekday')] ?? 0,
  }
}

/**
 * The instant for wall clock "HH:mm" on local "YYYY-MM-DD" in `timezone`. "24:00"
 * is the next midnight. One correction pass handles a clock change between the
 * naive guess and the true instant; a time the clocks skip moves forward past the gap.
 */
export function zonedTimeToUtc(localDate: string, time: string, timezone: string): Date {
  const [hour, minute] = time.split(':').map(Number)
  const [year, month, day] = localDate.split('-').map(Number)
  const naiveUtcMs = Date.UTC(year, month - 1, day, hour, minute, 0)

  const offset1 = offsetMinutesAt(new Date(naiveUtcMs), timezone)
  const guessMs = naiveUtcMs - offset1 * 60_000

  const offset2 = offsetMinutesAt(new Date(guessMs), timezone)
  if (offset2 === offset1) return new Date(guessMs)

  const correctedMs = naiveUtcMs - offset2 * 60_000
  if (offsetMinutesAt(new Date(correctedMs), timezone) !== offset2) return new Date(Math.max(guessMs, correctedMs))
  return new Date(correctedMs)
}

/** Minutes to add to a UTC instant to read `timezone`'s wall clock; negative west of UTC. */
function offsetMinutesAt(instant: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant)

  const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))

  return (asUtc - instant.getTime()) / 60_000
}

export function shiftDate(localDate: string, days: number): string {
  const date = new Date(`${localDate}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function weekdayOf(localDate: string): number {
  return new Date(`${localDate}T12:00:00Z`).getUTCDay()
}

/** "HH:mm" as minutes past midnight. "24:00" is 1440. */
export function minutesOf(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** "America/New_York" as "New York". */
export function zoneCity(timezone: string): string {
  return (timezone.split('/').pop() ?? timezone).replaceAll('_', ' ')
}

/**
 * "10:30 am". Some ICU builds put a narrow no-break space before AM/PM, which
 * renders as a stray character in plain text email, so it becomes a plain space.
 */
export function formatTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: timezone, hour: 'numeric', minute: '2-digit', hour12: true })
    .format(date)
    .replace(/ /g, ' ')
    .toLowerCase()
}

/** "Tuesday, Nov 18 at 10:30 am" in `timezone`. */
export function formatWhen(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, weekday: 'long', month: 'short', day: 'numeric' }).formatToParts(date)
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? ''
  return `${get('weekday')}, ${get('month')} ${get('day')} at ${formatTime(date, timezone)}`
}
