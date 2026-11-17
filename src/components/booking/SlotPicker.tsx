import Link from 'next/link'
import { PendingHint } from './PendingHint'

export type SlotChoiceGroup = { label: string; slots: { href: string; label: string }[] }

/** Times split by part of the day so a long day stays easy to scan. `level` is the step heading's level. */
export function SlotPicker({ groups, keepScroll = false, level = 2 }: { groups: SlotChoiceGroup[]; keepScroll?: boolean; level?: 2 | 3 }) {
  const Head = level === 3 ? 'h4' : 'h3'
  return (
    <div>
      {groups.map(group => (
        <section className="bk-period" key={group.label}>
          <div className="bk-period-head">
            <Head>{group.label}</Head>
            <p>{group.slots.length} {group.slots.length === 1 ? 'time' : 'times'}</p>
          </div>
          <ul className="bk-slots">
            {group.slots.map(slot => (
              <li key={slot.href}>
                <Link className="bk-slot" href={slot.href} prefetch={false} scroll={!keepScroll}>
                  {slot.label}
                  <PendingHint />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
