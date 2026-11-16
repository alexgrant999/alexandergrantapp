import Link from 'next/link'
import { PendingHint } from './PendingHint'

export type DayChoice = { href: string; tag?: string; label: string; count: number }

/**
 * Tappable days only. No date input anywhere in booking. `keepScroll` leaves the page where
 * it is on navigation, for the flow, whose StepHeading brings its own top back into view.
 */
export function DayPicker({ days, keepScroll = false }: { days: DayChoice[]; keepScroll?: boolean }) {
  return (
    <ul className="bk-list">
      {days.map(day => (
        <li key={day.href}>
          <Link className="bk-day" href={day.href} prefetch={false} scroll={!keepScroll}>
            <span className="bk-day-when">
              {day.tag && <span className="bk-day-tag">{day.tag}</span>}
              <span className="bk-day-name">{day.label}</span>
            </span>
            <span className="bk-day-count">{day.count} {day.count === 1 ? 'time' : 'times'}</span>
            <PendingHint />
          </Link>
        </li>
      ))}
    </ul>
  )
}
