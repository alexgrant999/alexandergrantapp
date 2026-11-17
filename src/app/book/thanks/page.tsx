import type { Metadata } from 'next'
import Link from 'next/link'
import { CALL_MINUTES, getPublicBooking } from '@/lib/services/booking'
import { BookingShell } from '@/components/booking/BookingShell'
import { BookingSummary } from '@/components/booking/BookingSummary'
import { BookCallConversion } from '@/components/booking/BookCallConversion'
import { WhatsAppLink } from '@/components/booking/ContactLinks'
import { firstParam, formatDayLong, formatTime, zoneCity } from '@/components/booking/format'

export const metadata: Metadata = {
  title: 'You’re booked | Alexander Grant',
  robots: { index: false, follow: false },
}

/**
 * After a booking. The id in ?b= is the only key, and getPublicBooking returns nothing
 * beyond a first name and the time, so this page shows nothing private.
 */
export default async function ThanksPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const id = firstParam((await searchParams).b)

  // The booking action lands here without an id when it turns a submission away as automated.
  // A person who got here that way reads a plain next step, not an error.
  if (!id) {
    return (
      <BookingShell folio="Book a call" step="Thanks" intro={<h1 className="bk-h1 bk-h1-quiet">Thanks.</h1>}>
        <p className="bk-copy" style={{ marginTop: 0 }}>If your booking went through, a confirmation email will reach you in the next few minutes. If nothing arrives, book again or send me a message.</p>
        <div className="bk-actions">
          <Link className="bk-button" href="/book">Book a call</Link>
          <WhatsAppLink className="bk-textlink">Message me on WhatsApp</WhatsAppLink>
        </div>
      </BookingShell>
    )
  }

  const booking = await getPublicBooking(id)

  if (!booking) {
    return (
      <BookingShell folio="Book a call" step="Not found" intro={<h1 className="bk-h1 bk-h1-quiet">I can’t find that booking.</h1>}>
        <p className="bk-copy" style={{ marginTop: 0 }}>The link may be incomplete. If you booked a call, the confirmation email has the details.</p>
        <div className="bk-actions">
          <Link className="bk-button" href="/book">Book a call</Link>
        </div>
      </BookingShell>
    )
  }

  const zone = booking.timezone
  const cancelled = booking.status === 'CANCELLED'
  const greeting = booking.firstName ? `Thanks, ${booking.firstName}.` : 'Thanks.'

  return (
    <BookingShell
      folio="Book a call"
      step={cancelled ? 'Cancelled' : 'Booked'}
      intro={<h1 className="bk-h1 bk-h1-quiet">{cancelled ? 'This call was cancelled.' : `${greeting} You’re booked.`}</h1>}
      aside={
        cancelled ? undefined : (
          <section aria-labelledby="bk-next">
            <h2 id="bk-next" className="bk-h3">What happens next</h2>
            <ol className="bk-next">
              <li><span><b>A confirmation email is on its way.</b> It has a calendar invite and a link to move or cancel the call.</span></li>
              <li><span><b>I look at your business first.</b> The fifteen minutes go on what matters to you, not on introductions.</span></li>
              <li>
                <div>
                  <b>At {formatTime(booking.startsAt, zone)}, join the call.</b>
                  {booking.meetingUrl
                    ? <>The link is in your email, and here:<a className="bk-textlink" href={booking.meetingUrl} style={{ display: 'flex', overflowWrap: 'anywhere' }}>{booking.meetingUrl}</a></>
                    : 'I’ll email you the link before the call.'}
                </div>
              </li>
            </ol>
          </section>
        )
      }
    >
      {!cancelled && <BookCallConversion bookingId={booking.id} />}
      <BookingSummary
        caption={`Your call with Alex, in ${zoneCity(zone)} time`}
        rows={[
          { label: 'Day', value: formatDayLong(booking.startsAt, zone) },
          { label: 'Time', value: formatTime(booking.startsAt, zone), figure: !cancelled },
          { label: 'Length', value: `${CALL_MINUTES} minutes` },
        ]}
      />
      {cancelled && (
        <div className="bk-actions">
          <Link className="bk-button" href="/book">Book another time</Link>
        </div>
      )}
    </BookingShell>
  )
}
