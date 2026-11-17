import type { DashboardBooking } from '@/lib/services/booking'
import { formatDayShort, formatTime, zoneCity } from '@/components/booking/format'
import { BookingRowActions } from './BookingRowActions'
import { PANEL } from './styles'

const TH = 'text-left px-6 py-4 text-xs font-medium text-[#c8c8d8] uppercase tracking-wider'

/** One table for upcoming or past calls. Times in Alex's zone, with the visitor's own clock beside it when it differs. */
export function BookingTable({ bookings, ownerZone, now, empty }: { bookings: DashboardBooking[]; ownerZone: string; now: number; empty: string }) {
  return (
    <div className={`${PANEL} overflow-x-auto`}>
      <table className="w-full min-w-[960px] table-fixed">
        <thead>
          <tr className="border-b border-[#1e1e2e]">
            <th scope="col" className={`${TH} w-[200px]`}>When (New York)</th>
            <th scope="col" className={`${TH} w-[240px]`}>Who</th>
            <th scope="col" className={TH}>What they want to talk about</th>
            <th scope="col" className={`${TH} w-[180px]`}>Source</th>
            <th scope="col" className={`${TH} w-[270px]`}>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#c8c8d8]">{empty}</td>
            </tr>
          )}
          {bookings.map(b => {
            const started = new Date(b.startsAt).getTime() <= now
            const tags = b.attribution ?? {}
            const adClick = Boolean(tags.gclid || tags.gbraid || tags.wbraid)
            return (
              <tr key={b.id} className="border-b border-[#1e1e2e] last:border-0 align-top">
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-[#e8e8f0]">{formatDayShort(b.startsAt, ownerZone)}</p>
                  <p className="text-sm text-[#e8e8f0] tabular-nums">{formatTime(b.startsAt, ownerZone)}</p>
                  {b.timezone !== ownerZone && (
                    <p className="mt-1 text-sm text-[#c8c8d8] tabular-nums">
                      {formatDayShort(b.startsAt, b.timezone) === formatDayShort(b.startsAt, ownerZone) ? '' : `${formatDayShort(b.startsAt, b.timezone)}, `}
                      {formatTime(b.startsAt, b.timezone)} in {zoneCity(b.timezone)}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 break-words">
                  <p className="text-sm font-medium text-[#e8e8f0]">{b.name}</p>
                  <p className="text-sm text-[#c8c8d8]">{b.business}</p>
                  <a href={`mailto:${b.email}`} className="inline-flex min-h-8 items-center text-sm text-[#8b85ff] underline-offset-4 hover:underline break-all">{b.email}</a>
                  {b.meetingUrl && b.status === 'BOOKED' && (
                    <a href={b.meetingUrl} target="_blank" rel="noopener noreferrer" className="block text-sm font-medium text-[#8b85ff] underline underline-offset-4">
                      Join call<span className="sr-only"> with {b.name} (opens in a new tab)</span>
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 text-sm leading-relaxed text-[#c8c8d8] whitespace-pre-line break-words">
                  {b.need || 'Left blank'}
                </td>
                <td className="px-6 py-4 text-sm text-[#c8c8d8]">
                  <p className="text-[#e8e8f0] break-words">{b.source ?? (adClick ? 'Google ad' : 'Direct')}</p>
                  {adClick && b.source && <p>From a Google ad click</p>}
                  {tags.utm_campaign && <p className="break-words">Campaign: <span className="text-[#e8e8f0]">{tags.utm_campaign}</span></p>}
                  {tags.utm_term && <p className="break-words">Keyword: <span className="text-[#e8e8f0]">{tags.utm_term}</span></p>}
                  <p className="whitespace-nowrap">Booked {formatDayShort(b.createdAt, ownerZone)}</p>
                </td>
                <td className="px-6 py-4">
                  <BookingRowActions id={b.id} firstName={b.firstName} status={b.status} started={started} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
