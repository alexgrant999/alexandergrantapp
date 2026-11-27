import type { Slot } from '@/lib/services/booking'

type When = string | Date

// Newer ICU puts a narrow no-break space before "AM". Plain spaces keep server and browser output identical.
const tidy = (value: string) => value.replace(/[  ]/g, ' ')

function parts(at: When, timeZone: string) {
  const list = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(at))
  const get = (type: string) => list.find(p => p.type === type)?.value ?? ''
  return { date: `${get('year')}-${get('month')}-${get('day')}`, minutes: Number(get('hour')) * 60 + Number(get('minute')) }
}

// The same test as isIanaZone in lib/validators/booking, kept here so the booking pages do not ship zod to the browser.
export function isIanaZone(value: string): boolean {
  if (value.length > 64 || !/^(UTC|[A-Za-z_]+\/[A-Za-z0-9_/+-]+)$/.test(value)) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value })
    return true
  } catch {
    return false
  }
}

/** "America/New_York" reads as "New York". */
export function zoneCity(zone: string): string {
  return (zone.split('/').pop() ?? zone).replaceAll('_', ' ')
}

/** "2026-11-18": the calendar date of an instant on that zone's clock. */
export function zoneDate(at: When, timeZone: string): string {
  return parts(at, timeZone).date
}

export function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

/** "Tuesday 18 November" */
export function formatDayLong(at: When, timeZone: string): string {
  const list = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long', day: 'numeric', month: 'long' }).formatToParts(new Date(at))
  const get = (type: string) => list.find(p => p.type === type)?.value ?? ''
  return `${get('weekday')} ${get('day')} ${get('month')}`
}

/** "Tue 18 Nov" */
export function formatDayShort(at: When, timeZone: string): string {
  const list = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short', day: 'numeric', month: 'short' }).formatToParts(new Date(at))
  const get = (type: string) => list.find(p => p.type === type)?.value ?? ''
  return `${get('weekday')} ${get('day')} ${get('month')}`
}

/** "Tuesday" */
export function formatWeekday(at: When, timeZone: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'long' }).format(new Date(at))
}

/** "10:30 am" */
export function formatTime(at: When, timeZone: string): string {
  return tidy(new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(at))).toLowerCase()
}

export function partOfDay(at: When, timeZone: string): 'Night' | 'Morning' | 'Afternoon' | 'Evening' {
  const minutes = parts(at, timeZone).minutes
  if (minutes < 5 * 60) return 'Night'
  if (minutes < 12 * 60) return 'Morning'
  if (minutes < 17 * 60) return 'Afternoon'
  return 'Evening'
}

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export type DayGroup = { date: string; slots: Slot[] }

/**
 * Where a visitor is in the day, time, details steps, worked out from the query.
 * Days are grouped on the visitor's clock. A chosen time is matched against every
 * open slot, so changing the time zone on the details step keeps the choice.
 */
export function resolveSteps(slots: Slot[], timeZone: string, dayParam?: string, startsAtParam?: string) {
  const byDate = new Map<string, Slot[]>()
  for (const slot of [...slots].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())) {
    const date = zoneDate(slot.startsAt, timeZone)
    const list = byDate.get(date)
    if (list) list.push(slot)
    else byDate.set(date, [slot])
  }
  const days: DayGroup[] = [...byDate.entries()].map(([date, list]) => ({ date, slots: list })).sort((a, b) => a.date.localeCompare(b.date))

  const wanted = startsAtParam ? new Date(startsAtParam).getTime() : NaN
  const selected = Number.isNaN(wanted) ? undefined : slots.find(s => new Date(s.startsAt).getTime() === wanted)
  const dayKey = selected ? zoneDate(selected.startsAt, timeZone) : dayParam
  const day = days.find(d => d.date === dayKey)

  return { days, day, selected: day ? selected : undefined }
}

export type SlotGroup = { label: string; slots: Slot[] }

export function groupByPartOfDay(slots: Slot[], timeZone: string): SlotGroup[] {
  const groups: SlotGroup[] = []
  for (const slot of slots) {
    const label = partOfDay(slot.startsAt, timeZone)
    const group = groups.find(g => g.label === label)
    if (group) group.slots.push(slot)
    else groups.push({ label, slots: [slot] })
  }
  return groups
}

/**
 * The same instant in other zones, as "Sydney 7:00 pm, Brisbane 6:00 pm". `shownZone` is the
 * zone the main time is already in: it is left out, and a zone whose date differs from it gets
 * its weekday ("Brisbane 11:00 pm Fri").
 */
export function alsoIn(at: When, shownZone: string, zones: string[]): string {
  const shownDate = zoneDate(at, shownZone)
  return zones
    .filter(zone => zone !== shownZone)
    .map(zone => {
      const day = zoneDate(at, zone) === shownDate ? '' : ` ${new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'short' }).format(new Date(at))}`
      return `${zoneCity(zone)} ${formatTime(at, zone)}${day}`
    })
    .join(', ')
}
