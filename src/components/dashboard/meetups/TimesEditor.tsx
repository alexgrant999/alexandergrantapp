'use client'
import { GHOST, INPUT } from '@/components/dashboard/bookings/styles'

export type LocalTime = { date: string; time: string }

function nextDate(date: string): string {
  if (!date) return ''
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10)
}

/** Rows of date and start time, read on the poll's zone. "Add another" copies the last row a day later. */
export function TimesEditor({ times, onChange, disabled }: { times: LocalTime[]; onChange: (times: LocalTime[]) => void; disabled?: boolean }) {
  const set = (i: number, patch: Partial<LocalTime>) => onChange(times.map((t, j) => (j === i ? { ...t, ...patch } : t)))
  const last = times.at(-1)

  return (
    <div className="flex flex-col gap-2">
      {times.map((t, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <label className="sr-only" htmlFor={`t-date-${i}`}>Date for time {i + 1}</label>
          <input id={`t-date-${i}`} type="date" className={INPUT} value={t.date} disabled={disabled} onChange={e => set(i, { date: e.target.value })} />
          <label className="sr-only" htmlFor={`t-time-${i}`}>Start time for time {i + 1}</label>
          <input id={`t-time-${i}`} type="time" step={900} className={INPUT} value={t.time} disabled={disabled} onChange={e => set(i, { time: e.target.value })} />
          {times.length > 1 && (
            <button type="button" className={GHOST} disabled={disabled} onClick={() => onChange(times.filter((_, j) => j !== i))}>
              Remove<span className="sr-only"> time {i + 1}</span>
            </button>
          )}
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={GHOST} disabled={disabled} onClick={() => onChange([...times, { date: nextDate(last?.date ?? ''), time: last?.time ?? '19:00' }])}>
          Add another time
        </button>
        {last?.date && (
          <button type="button" className={GHOST} disabled={disabled} onClick={() => onChange([...times, { date: last.date, time: bump(last.time) }])}>
            Same day, an hour later
          </button>
        )}
      </div>
    </div>
  )
}

function bump(time: string): string {
  const [h, m] = (time || '19:00').split(':').map(Number)
  return `${String(Math.min(h + 1, 23)).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
