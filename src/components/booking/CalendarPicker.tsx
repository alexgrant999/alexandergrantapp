import Link from 'next/link'
import { PendingHint } from './PendingHint'
import { addDays } from './format'

export type CalendarDay = { date: string; href: string; label: string; count: number }
export type CalendarSlot = { href: string; label: string }

const WEEKDAYS = [['Sun', 'Sunday'], ['Mon', 'Monday'], ['Tue', 'Tuesday'], ['Wed', 'Wednesday'], ['Thu', 'Thursday'], ['Fri', 'Friday'], ['Sat', 'Saturday']]

/**
 * A month on the left with the open days marked, and the chosen day's times on the right.
 * Every open day and every time is a plain link, so it works without JavaScript. The month
 * shown is the chosen day's; the arrows step to the nearest open day in another month.
 */
export function CalendarPicker({
  days,
  selected,
  today,
  dayLabel,
  slots,
  keepScroll = false,
  level = 2,
}: {
  days: CalendarDay[]
  selected: string
  today: string
  dayLabel: string
  slots: CalendarSlot[]
  keepScroll?: boolean
  level?: 2 | 3
}) {
  const month = selected.slice(0, 7)
  const [year, monthNumber] = month.split('-').map(Number)
  const first = `${month}-01`
  const lead = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay()
  const length = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  const weeks = Array.from({ length: Math.ceil((lead + length) / 7) }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(first, w * 7 + d - lead)))
  const open = new Map(days.map(d => [d.date, d]))
  const prev = days.filter(d => d.date.slice(0, 7) < month).at(-1)
  const next = days.find(d => d.date.slice(0, 7) > month)
  const title = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' }).format(new Date(Date.UTC(year, monthNumber - 1, 1)))
  const Head = level === 3 ? 'h4' : 'h3'

  const arrow = (target: CalendarDay | undefined, label: string, path: string) => {
    const icon = <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true"><path d={path} /></svg>
    return target
      ? <Link className="bk-cal-arrow" href={target.href} prefetch={false} scroll={!keepScroll} aria-label={label}>{icon}</Link>
      : <span className="bk-cal-arrow" aria-disabled="true">{icon}<span className="sr-only">{label}, no open days</span></span>
  }

  return (
    <div className="bk-cal">
      <div className="bk-cal-month">
        <div className="bk-cal-head">
          <Head className="bk-cal-title">{title}</Head>
          <div className="bk-cal-nav">
            {arrow(prev, 'Previous month', 'M11 3 5 9l6 6')}
            {arrow(next, 'Next month', 'm7 3 6 6-6 6')}
          </div>
        </div>
        <table className="bk-cal-grid">
          <thead>
            <tr>{WEEKDAYS.map(([short, long]) => <th key={short} scope="col" abbr={long}>{short}</th>)}</tr>
          </thead>
          <tbody>
            {weeks.map(week => (
              <tr key={week[0]}>
                {week.map(date => {
                  const day = open.get(date)
                  const number = Number(date.slice(8))
                  const classes = ['bk-cal-day', date.slice(0, 7) !== month ? 'is-out' : '', date === today ? 'is-today' : ''].filter(Boolean).join(' ')
                  return (
                    <td key={date}>
                      {day ? (
                        <Link className={classes} href={day.href} prefetch={false} scroll={!keepScroll} aria-current={date === selected ? 'date' : undefined} aria-label={`${day.label}, ${day.count} ${day.count === 1 ? 'time' : 'times'}`}>
                          {number}
                          <PendingHint />
                        </Link>
                      ) : (
                        <span className={classes}>{number}</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bk-cal-times" aria-live="polite">
        <Head className="bk-cal-title">{dayLabel}</Head>
        <p className="bk-cal-count">{slots.length} {slots.length === 1 ? 'time' : 'times'}</p>
        <ul className="bk-cal-slots">
          {slots.map(slot => (
            <li key={slot.href}>
              <Link className="bk-slot" href={slot.href} prefetch={false} scroll={!keepScroll}>
                {slot.label}
                <PendingHint />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
