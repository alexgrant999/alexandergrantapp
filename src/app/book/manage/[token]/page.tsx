import type { Metadata } from 'next'
import Link from 'next/link'
import { CALL_MINUTES, getAvailableSlots, getBookingByToken } from '@/lib/services/booking'
import { BookingShell } from '@/components/booking/BookingShell'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { DayPicker } from '@/components/booking/DayPicker'
import { SlotPicker } from '@/components/booking/SlotPicker'
import { TimezonePicker } from '@/components/booking/TimezonePicker'
import { CancelCall, MoveCall } from '@/components/booking/ManageActions'
import { WhatsAppLink } from '@/components/booking/ContactLinks'
import { StatusNote } from '@/components/booking/StatusNote'
import { addDays, firstParam, formatDayLong, formatTime, formatWeekday, groupByPartOfDay, isIanaZone, resolveSteps, zoneCity, zoneDate } from '@/components/booking/format'

export const metadata: Metadata = {
  title: 'Your call | Alexander Grant',
  robots: { index: false, follow: false },
  // The token is in this page's URL; no referrer, so following the meeting link never hands it to that site.
  referrer: 'no-referrer',
}

type Query = Record<string, string | string[] | undefined>

/**
 * The visitor's own page for one booking, reached from the link in their confirmation.
 * The token names one booking, so nothing here reaches anyone else's. Moving the call
 * reuses the /book steps (day, time, confirm); cancelling asks once more first.
 */
export default async function ManageBookingPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<Query> }) {
  const { token } = await params
  const query = await searchParams
  const booking = await getBookingByToken(token)
  const base = `/book/manage/${encodeURIComponent(token)}`

  if (!booking) {
    return (
      <BookingShell folio="Your call" step="Link not recognised" intro={<h1 className="bk-h1 bk-h1-quiet">This link doesn’t match a booking.</h1>}>
        <p className="bk-copy" style={{ marginTop: 0 }}>It may have been copied only in part. Try the link in your confirmation email again, or book a new time.</p>
        <div className="bk-actions">
          <Link className="bk-button" href="/book">Book a call</Link>
          <WhatsAppLink className="bk-textlink">Or message me on WhatsApp</WhatsAppLink>
        </div>
      </BookingShell>
    )
  }

  const tzParam = firstParam(query.tz)
  const tz = tzParam && isIanaZone(tzParam) ? tzParam : null
  const zone = tz ?? booking.timezone
  const when = `${formatDayLong(booking.startsAt, zone)}, ${formatTime(booking.startsAt, zone)}`
  const zoneLine = <TimezonePicker current={zone} />
  const withTz = (params: Record<string, string>) => {
    const search = new URLSearchParams(params)
    if (tz) search.set('tz', tz)
    const qs = search.toString()
    return qs ? `${base}?${qs}` : base
  }

  if (booking.status === 'CANCELLED') {
    return (
      <BookingShell folio="Your call" step="Cancelled" intro={<h1 className="bk-h1 bk-h1-quiet">Your call is cancelled.</h1>}>
        <StatusNote message={firstParam(query.cancelled) === '1' ? 'Done. I’ve been told, so there’s nothing else you need to do.' : ''} />
        <p className="bk-copy" style={{ marginTop: 0 }}>It was booked for {when} ({zoneCity(zone)} time). If you’d like to talk another time, pick a new one.</p>
        <div className="bk-actions">
          <Link className="bk-button" href="/book">Book another time</Link>
        </div>
      </BookingShell>
    )
  }

  const meetingLink = booking.meetingUrl && (
    <>
      <p className="bk-copy">The link for the call:</p>
      <a className="bk-textlink" href={booking.meetingUrl} rel="noreferrer" style={{ display: 'flex', overflowWrap: 'anywhere' }}>{booking.meetingUrl}</a>
    </>
  )

  // Matches the service: a call can be moved or cancelled only before it starts.
  const now = Date.now()
  if (booking.status === 'BOOKED' && new Date(booking.startsAt).getTime() <= now && new Date(booking.endsAt).getTime() > now) {
    return (
      <BookingShell folio="Your call" step="Under way" intro={<h1 className="bk-h1 bk-h1-quiet">Your call is under way.</h1>}>
        <p className="bk-copy" style={{ marginTop: 0 }}>It started at {formatTime(booking.startsAt, zone)} ({zoneCity(zone)} time), so it can’t be moved or cancelled now.</p>
        {meetingLink ?? <p className="bk-copy">The link is in your confirmation email.</p>}
      </BookingShell>
    )
  }

  if (booking.status !== 'BOOKED' || new Date(booking.startsAt).getTime() <= now) {
    return (
      <BookingShell folio="Your call" step="Passed" intro={<h1 className="bk-h1 bk-h1-quiet">This call has already happened.</h1>}>
        <p className="bk-copy" style={{ marginTop: 0 }}>It was on {when}, so it can’t be changed now. If you’d like to talk again, book a new time.</p>
        <div className="bk-actions">
          <Link className="bk-button" href="/book">Book another time</Link>
        </div>
      </BookingShell>
    )
  }

  const booked = <BookingSummary rows={[{ label: 'Booked day', value: formatDayLong(booking.startsAt, zone) }, { label: 'Booked time', value: formatTime(booking.startsAt, zone) }]} />

  if (firstParam(query.cancel) === '1') {
    return (
      <BookingShell folio="Your call" step="Cancel" back={{ href: withTz({}), label: 'Back to your call' }} intro={<><h1 className="bk-h1 bk-h1-quiet">Cancel this call?</h1>{booked}</>}>
        <p className="bk-copy" style={{ marginTop: 0 }}>I’ll be told straight away. If another time would suit you better, you can move it instead.</p>
        <CancelCall token={token} base={base} />
        <p className="bk-copy"><Link className="bk-textlink" href={withTz({ change: '1' })} prefetch={false}>Move it to another time</Link></p>
      </BookingShell>
    )
  }

  if (firstParam(query.change) === '1') {
    // Leaves this booking out so it does not block the times beside it, and drops its own time from the list.
    const slots = (await getAvailableSlots({ excludeBookingId: booking.id })).filter(s => s.startsAt !== booking.startsAt)
    const { days, day, selected } = resolveSteps(slots, zone, firstParam(query.day), firstParam(query.startsAt))
    const intro = <><h1 className="bk-h1 bk-h1-quiet">Move your call.</h1>{booked}</>

    if (days.length === 0) {
      return (
        <BookingShell folio="Your call" step="Move" back={{ href: withTz({}), label: 'Back to your call' }} intro={intro}>
          <h2 className="bk-h2">No other times are open right now.</h2>
          <p className="bk-copy">Your call stays where it is. If it no longer suits you, message me and I’ll find a time.</p>
          <div className="bk-actions">
            <WhatsAppLink className="bk-button">Message me on WhatsApp</WhatsAppLink>
            <a className="bk-textlink" href="mailto:alexandergrantapp@gmail.com?subject=Moving%20our%20call" style={{ overflowWrap: 'anywhere' }}>alexandergrantapp@gmail.com</a>
          </div>
        </BookingShell>
      )
    }

    if (!day) {
      const today = zoneDate(new Date(), zone)
      const tomorrow = addDays(today, 1)
      return (
        <BookingShell folio="Your call" step="Move, step 1 of 3" back={{ href: withTz({}), label: 'Back to your call' }} intro={intro}>
          <h2 className="bk-h2">Pick a new day</h2>
          {zoneLine}
          <DayPicker
            days={days.map(d => ({
              href: withTz({ change: '1', day: d.date }),
              tag: d.date === today ? 'Today' : d.date === tomorrow ? 'Tomorrow' : undefined,
              label: formatDayLong(d.slots[0].startsAt, zone),
              count: d.slots.length,
            }))}
          />
        </BookingShell>
      )
    }

    const first = day.slots[0].startsAt
    if (!selected) {
      const isToday = day.date === zoneDate(new Date(), zone)
      return (
        <BookingShell folio="Your call" step="Move, step 2 of 3" back={{ href: withTz({ change: '1' }), label: 'Back to days' }} intro={intro}>
          <h2 className="bk-h2">{isToday ? 'Pick a new time today' : `Pick a new time on ${formatWeekday(first, zone)}`}</h2>
          {zoneLine}
          <SlotPicker
            groups={groupByPartOfDay(day.slots, zone).map(g => ({
              label: g.label,
              slots: g.slots.map(s => ({ href: withTz({ change: '1', day: day.date, startsAt: s.startsAt }), label: formatTime(s.startsAt, zone) })),
            }))}
          />
        </BookingShell>
      )
    }

    const time = formatTime(selected.startsAt, zone)
    const chooseTimeHref = withTz({ change: '1', day: day.date })
    return (
      <BookingShell folio="Your call" step="Move, step 3 of 3" back={{ href: chooseTimeHref, label: 'Back to times' }} intro={intro}>
        <h2 className="bk-h2">Move it to this time?</h2>
        {zoneLine}
        <BookingSummary rows={[{ label: 'New day', value: formatDayLong(selected.startsAt, zone) }, { label: 'New time', value: time }]} />
        <MoveCall token={token} startsAt={selected.startsAt} base={base} chooseTimeHref={chooseTimeHref} label={`Move to ${formatWeekday(selected.startsAt, zone)} at ${time}`} />
      </BookingShell>
    )
  }

  return (
    <BookingShell folio="Your call" step="Booked" intro={<h1 className="bk-h1 bk-h1-quiet">Your call with Alex.</h1>}>
      <StatusNote message={firstParam(query.moved) === '1' ? 'Moved. I’ve been told, and a new confirmation is on its way.' : ''} />
      <BookingSummary
        rows={[
          { label: 'Day', value: formatDayLong(booking.startsAt, zone) },
          { label: 'Time', value: formatTime(booking.startsAt, zone), figure: true },
          { label: 'Length', value: `${CALL_MINUTES} minutes` },
        ]}
      />
      {zoneLine}
      {meetingLink}
      <div className="bk-actions">
        <Link className="bk-button" href={withTz({ change: '1' })} prefetch={false}>Pick a new time</Link>
        <Link className="bk-textlink" href={withTz({ cancel: '1' })} prefetch={false}>Cancel the call</Link>
      </div>
    </BookingShell>
  )
}
