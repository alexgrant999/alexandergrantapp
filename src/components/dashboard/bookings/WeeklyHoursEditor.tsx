'use client'
import { useState, useTransition } from 'react'
import { Plus, X } from 'lucide-react'
import { saveWeeklyHoursAction } from '@/app/dashboard/bookings/actions'
import type { WeeklyHours } from '@/lib/services/booking'
import { GHOST, INPUT, PRIMARY } from './styles'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
// Shown Monday first; stored with Sunday as 0.
const ORDER = [1, 2, 3, 4, 5, 6, 0]

type Range = { start: string; end: string }
type Day = { on: boolean; ranges: Range[] }

const DEFAULT_RANGE: Range = { start: '09:00', end: '17:00' }

function toDays(hours: WeeklyHours): Day[] {
  return DAY_NAMES.map((_, dayOfWeek) => {
    const ranges = hours.filter(h => h.dayOfWeek === dayOfWeek).map(h => ({ start: h.startTime, end: h.endTime }))
    return { on: ranges.length > 0, ranges: ranges.length > 0 ? ranges : [DEFAULT_RANGE] }
  })
}

/**
 * The week Alex takes calls, in his own zone. A day can hold more than one range
 * (a morning and a late afternoon, say). Switching a day off keeps its ranges here
 * until the page reloads, so switching it back on does not lose them.
 */
export function WeeklyHoursEditor({ initial, note }: { initial: WeeklyHours; note: string }) {
  const [days, setDays] = useState<Day[]>(() => toDays(initial))
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  const update = (dayOfWeek: number, change: (day: Day) => Day) => setDays(all => all.map((d, i) => (i === dayOfWeek ? change(d) : d)))
  const setRange = (dayOfWeek: number, index: number, field: keyof Range, value: string) =>
    update(dayOfWeek, d => ({ ...d, ranges: d.ranges.map((r, i) => (i === index ? { ...r, [field]: value } : r)) }))

  const save = () => {
    const backwards = ORDER.find(i => days[i].on && days[i].ranges.some(r => !r.start || !r.end || r.end <= r.start))
    if (backwards !== undefined) {
      setMessage(`${DAY_NAMES[backwards]}: each range needs to end after it starts.`)
      return
    }
    const hours: WeeklyHours = days.flatMap((d, dayOfWeek) => (d.on ? d.ranges.map(r => ({ dayOfWeek, startTime: r.start, endTime: r.end })) : []))
    setMessage('')
    startTransition(async () => {
      const result = await saveWeeklyHoursAction(hours)
      setMessage(
        result.ok
          ? hours.length > 0 ? 'Saved. The booking page offers these hours now.' : 'Saved. With no hours set, nobody can book.'
          : result.error ?? 'That did not save. Try again.',
      )
    })
  }

  return (
    <div>
      <p className="text-sm text-[#c8c8d8]">{note}</p>
      <ul className="mt-4 divide-y divide-[#1e1e2e] border-y border-[#1e1e2e]">
        {ORDER.map(dayOfWeek => {
          const day = days[dayOfWeek]
          const name = DAY_NAMES[dayOfWeek]
          return (
            <li key={dayOfWeek} className="flex flex-wrap items-start gap-x-6 gap-y-2 py-3">
              <label className="flex min-h-11 w-36 cursor-pointer items-center gap-3 text-sm font-medium text-[#e8e8f0]">
                <input type="checkbox" className="size-5 accent-[#6c63ff]" checked={day.on} onChange={e => update(dayOfWeek, d => ({ ...d, on: e.target.checked }))} />
                {name}
              </label>
              {day.on ? (
                <div className="flex flex-1 flex-col gap-2">
                  {day.ranges.map((range, index) => (
                    <div key={index} className="flex flex-wrap items-center gap-2">
                      <input type="time" step={900} className={INPUT} aria-label={`${name}, range ${index + 1}, from`} value={range.start} onChange={e => setRange(dayOfWeek, index, 'start', e.target.value)} />
                      <span className="text-sm text-[#c8c8d8]">to</span>
                      <input type="time" step={900} className={INPUT} aria-label={`${name}, range ${index + 1}, until`} value={range.end} onChange={e => setRange(dayOfWeek, index, 'end', e.target.value)} />
                      {day.ranges.length > 1 && (
                        <button type="button" className={`${GHOST} px-3`} onClick={() => update(dayOfWeek, d => ({ ...d, ranges: d.ranges.filter((_, i) => i !== index) }))}>
                          <X size={14} aria-hidden="true" /><span className="sr-only">Remove {name} range {index + 1}</span>
                        </button>
                      )}
                      {index === day.ranges.length - 1 && (
                        <button type="button" className={`${GHOST} px-3`} title="Add another range" onClick={() => update(dayOfWeek, d => ({ ...d, ranges: [...d.ranges, { start: '', end: '' }] }))}>
                          <Plus size={14} aria-hidden="true" /><span className="sr-only">Add another range on {name}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="flex min-h-11 items-center text-sm text-[#c8c8d8]">No calls</p>
              )}
            </li>
          )
        })}
      </ul>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="button" className={PRIMARY} disabled={pending} onClick={save}>{pending ? 'Saving…' : 'Save hours'}</button>
        <p className="text-sm text-[#e8e8f0]" aria-live="polite">{message}</p>
      </div>
    </div>
  )
}
