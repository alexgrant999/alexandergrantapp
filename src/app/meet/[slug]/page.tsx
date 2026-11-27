import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { BookingShell } from '@/components/booking/BookingShell'
import { TimezonePicker } from '@/components/booking/TimezonePicker'
import { VisitorTimezone } from '@/components/booking/VisitorTimezone'
import { firstParam, formatDayLong, formatTime, isIanaZone, zoneDate } from '@/components/booking/format'
import { googleCalendarTemplateUrl } from '@/lib/services/booking-email'
import { findOwnResponse, getPublicPoll } from '@/lib/services/group-poll'
import { POLL_COOKIE_PREFIX } from '@/lib/validators/group-poll'
import { PollForm, type PollDay } from './PollForm'
import { PollStyles } from './PollStyles'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const poll = await getPublicPoll((await params).slug)
  const title = poll ? `${poll.title}: find a time` : 'Find a time'
  return {
    title,
    description: poll?.note ?? 'Mark the times you can make and see what works for everyone.',
    openGraph: { title, description: 'Mark the times you can make and see what works for everyone.' },
    robots: { index: false, follow: false },
  }
}

function duration(minutes: number): string {
  if (minutes % 60 === 0) return minutes === 60 ? '1 hour' : `${minutes / 60} hours`
  if (minutes > 60) return `${Math.floor(minutes / 60)} hr ${minutes % 60} min`
  return `${minutes} minutes`
}

/**
 * A group's "find a time" poll, shared as a link. Every time is shown on the
 * visitor's own clock (?tz=, set once by VisitorTimezone, the same as /book).
 * A browser that has answered before gets its answers back from the gp_<slug> cookie.
 */
export default async function MeetPage({ params, searchParams }: Props) {
  const { slug } = await params
  const query = await searchParams
  const poll = await getPublicPoll(slug)
  if (!poll) notFound()

  const tzParam = firstParam(query.tz)
  const tz = tzParam && isIanaZone(tzParam) ? tzParam : null
  const zone = tz ?? poll.timezone

  const jar = await cookies()
  const own = await findOwnResponse(slug, jar.get(`${POLL_COOKIE_PREFIX}${slug}`)?.value ?? null)
  const ownAnswers: Record<string, 'yes' | 'maybe'> = {}
  for (const id of own?.maybe ?? []) ownAnswers[id] = 'maybe'
  for (const id of own?.yes ?? []) ownAnswers[id] = 'yes'

  const byDate = new Map<string, PollDay>()
  for (const option of poll.options) {
    const date = zoneDate(option.startsAt, zone)
    const day = byDate.get(date) ?? { date, label: formatDayLong(option.startsAt, zone), rows: [] }
    day.rows.push({
      id: option.id,
      time: `${formatTime(option.startsAt, zone)} to ${formatTime(option.endsAt, zone)}`,
      past: option.past,
      chosen: option.id === poll.chosenOptionId,
      best: option.id === poll.bestOptionId,
      yes: option.tally.yes,
      maybe: option.tally.maybe,
    })
    byDate.set(date, day)
  }
  const days = [...byDate.values()]

  const chosen = poll.options.find(o => o.id === poll.chosenOptionId)
  const best = poll.options.find(o => o.id === poll.bestOptionId)
  const people = poll.responses.length

  return (
    <BookingShell
      folio="Find a time"
      step={people === 0 ? 'No answers yet' : `${people} ${people === 1 ? 'person has' : 'people have'} answered`}
      intro={
        <>
          <PollStyles />
          <VisitorTimezone current={tz} />
          <h1 className="bk-h1">{poll.title}</h1>
          {poll.note && <p className="bk-lead gp-note">{poll.note}</p>}
          <p className="bk-copy">Online, {duration(poll.durationMinutes)}.{poll.closed && !chosen ? ' This poll has closed.' : ''}</p>

          {chosen ? (
            <>
              <table className="bk-ledger">
                <caption>It’s settled</caption>
                <tbody>
                  <tr><th scope="row">{formatDayLong(chosen.startsAt, zone)}</th><td>{formatTime(chosen.startsAt, zone)}</td></tr>
                  <tr className="bk-figure"><th scope="row">Coming</th><td>{chosen.tally.yes.length + chosen.tally.maybe.length}</td></tr>
                </tbody>
              </table>
              <div className="bk-actions">
                <a className="bk-button" href={`/meet/${poll.slug}/ics`}>Add to my calendar</a>
                <a
                  className="bk-textlink"
                  href={googleCalendarTemplateUrl({
                    title: poll.title,
                    start: new Date(chosen.startsAt),
                    end: new Date(chosen.endsAt),
                    details: [poll.note ?? '', poll.url].filter(Boolean).join('\n\n'),
                    location: poll.meetingUrl ?? '',
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Calendar<span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
              {poll.meetingUrl && (
                <p className="bk-copy">Join here: <a className="bk-textlink" href={poll.meetingUrl} style={{ overflowWrap: 'anywhere' }}>{poll.meetingUrl}</a></p>
              )}
            </>
          ) : best ? (
            <table className="bk-ledger">
              <caption>Looking best so far</caption>
              <tbody>
                <tr><th scope="row">{formatDayLong(best.startsAt, zone)}</th><td>{formatTime(best.startsAt, zone)}</td></tr>
                <tr className="bk-figure"><th scope="row">Can make it</th><td>{best.tally.yes.length}</td></tr>
              </tbody>
            </table>
          ) : null}

          <TimezonePicker current={zone} />
        </>
      }
      aside={
        people > 0 ? (
          <section aria-labelledby="gp-who">
            <h2 id="gp-who" className="bk-h3">Who has answered</h2>
            <ul className="gp-people">
              {poll.responses.map(r => (
                <li key={r.id}>
                  <b>{r.name}</b>
                  <span>{r.yes.length} {r.yes.length === 1 ? 'time' : 'times'}{r.maybe.length > 0 ? `, ${r.maybe.length} if need be` : ''}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : undefined
      }
    >
      <PollForm slug={poll.slug} days={days} ownName={own?.name ?? ''} ownAnswers={ownAnswers} closed={poll.closed} />
    </BookingShell>
  )
}
