export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import {
  CALL_MINUTES,
  MAX_CALLS_PER_DAY,
  NOTICE_MINUTES,
  OWNER_TIMEZONE,
  SLOT_STEP_MINUTES,
  getWeeklyHours,
  listBookings,
  listTimeOff,
} from '@/lib/services/booking'
import { zoneCity } from '@/components/booking/format'
import { BookingTable } from '@/components/dashboard/bookings/BookingTable'
import { WeeklyHoursEditor } from '@/components/dashboard/bookings/WeeklyHoursEditor'
import { TimeOffEditor } from '@/components/dashboard/bookings/TimeOffEditor'
import { PANEL, SECTION_LABEL } from '@/components/dashboard/bookings/styles'

export default async function BookingsPage() {
  const [{ upcoming, past }, hours, timeOff] = await Promise.all([listBookings(), getWeeklyHours(), listTimeOff()])
  const now = Date.now()
  const zone = `${zoneCity(OWNER_TIMEZONE)} time`
  const needsMarking = past.filter(b => b.status === 'BOOKED').length

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8f0]">Bookings</h1>
          <p className="mt-1 text-sm text-[#c8c8d8]">
            {CALL_MINUTES} minute calls booked from the public page · {upcoming.length} coming up
            {needsMarking > 0 && ` · ${needsMarking} past ${needsMarking === 1 ? 'call needs' : 'calls need'} marking`}
          </p>
        </div>
        <Link href="/book" target="_blank" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#8b85ff] underline-offset-4 hover:underline">
          Open the booking page <ExternalLink size={14} aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span>
        </Link>
      </div>

      {hours.length === 0 && (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d9b87a]/40 bg-[#d9b87a]/10 px-6 py-5">
          <div>
            <p className="font-semibold text-[#e8e8f0]">Nobody can book a call yet.</p>
            <p className="mt-1 text-sm text-[#e8e8f0]">The booking page has no times to offer until you set the hours you take calls.</p>
          </div>
          <a href="#hours" className="inline-flex min-h-11 items-center rounded-lg bg-[#d9b87a] px-4 text-sm font-semibold text-[#0a0a0f] hover:bg-[#d9b87a]/85">Set your hours</a>
        </div>
      )}

      <section aria-labelledby="upcoming-heading">
        <h2 id="upcoming-heading" className={`${SECTION_LABEL} mb-4`}>Coming up</h2>
        <BookingTable
          bookings={upcoming}
          ownerZone={OWNER_TIMEZONE}
          now={now}
          empty={hours.length === 0 ? 'No calls booked. Set your hours below and the booking page will start offering times.' : 'No calls booked yet. Share alexandergrant.app/book to get some.'}
        />
      </section>

      <section aria-labelledby="past-heading" className="mt-10">
        <h2 id="past-heading" className={`${SECTION_LABEL} mb-4`}>Past and cancelled</h2>
        <BookingTable bookings={past} ownerZone={OWNER_TIMEZONE} now={now} empty="Calls you have had, and any that were cancelled, will show here." />
      </section>

      <div className="mt-10 grid items-start gap-6 xl:grid-cols-2">
        <section id="hours" aria-labelledby="hours-heading" className={`${PANEL} scroll-mt-8 p-6`}>
          <h2 id="hours-heading" className="text-lg font-semibold text-[#e8e8f0]">Hours you take calls</h2>
          <div className="mt-3">
            <WeeklyHoursEditor
              initial={hours}
              note={`All times ${zone}. Calls start every ${SLOT_STEP_MINUTES} minutes inside these hours, at least ${NOTICE_MINUTES / 60} hours ahead, and no more than ${MAX_CALLS_PER_DAY} a day.`}
            />
          </div>
        </section>
        <section id="time-off" aria-labelledby="time-off-heading" className={`${PANEL} scroll-mt-8 p-6`}>
          <h2 id="time-off-heading" className="text-lg font-semibold text-[#e8e8f0]">Time off</h2>
          <p className="mt-1 text-sm text-[#c8c8d8]">All times {zone}.</p>
          <div className="mt-4">
            <TimeOffEditor blocks={timeOff} ownerZone={OWNER_TIMEZONE} />
          </div>
        </section>
      </div>
    </div>
  )
}
