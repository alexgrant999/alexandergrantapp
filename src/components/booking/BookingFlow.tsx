import Link from 'next/link'
import type { ReactNode } from 'react'
import { CALL_MINUTES, OWNER_TIMEZONE, getAvailableSlots } from '@/lib/services/booking'
import { smsRemindersEnabled } from '@/lib/services/booking-reminders'
import { ATTRIBUTION_KEYS } from '@/lib/validators/booking'
import { BookingFlowStyles } from './BookingStyles'
import { BookingSummary } from './BookingSummary'
import { BookForm } from './BookForm'
import { WhatsAppLink } from './ContactLinks'
import { CalendarPicker } from './CalendarPicker'
import { StepHeading } from './StepHeading'
import { TimezonePicker } from './TimezonePicker'
import { VisitorTimezone } from './VisitorTimezone'
import { firstParam, formatDayLong, formatTime, formatWeekday, isIanaZone, resolveSteps, zoneDate } from './format'

type Query = Record<string, string | string[] | undefined>

/**
 * The day, time and details steps for booking a call, as one piece that any page can hold:
 * /book wraps it in BookingShell, and an ad landing page can drop it into a section.
 *
 * Every step is a plain link back to `basePath` carrying the choices in the query string
 * (?day=, ?startsAt=, ?tz=) along with any ad click ids and UTM tags the visitor arrived
 * with, so those survive to the form's hidden fields. Days and times are on the visitor's
 * clock (?tz=, set once by VisitorTimezone), not Alex's.
 *
 * `standalone` adds the flow's own styles, for a page that does not use BookingShell.
 * `headingLevel` 3 fits the flow under a landing page's own h2.
 */
export async function BookingFlow({
  searchParams,
  basePath = '/book',
  headingLevel = 2,
  standalone = false,
  anchor = '',
}: {
  searchParams: Query | Promise<Query>
  basePath?: string
  headingLevel?: 2 | 3
  standalone?: boolean
  /** Hash added to every step link, so a page that holds the flow lower down returns to it. */
  anchor?: string
}) {
  const query = await searchParams
  const tzParam = firstParam(query.tz)
  const tz = tzParam && isIanaZone(tzParam) ? tzParam : null
  const zone = tz ?? OWNER_TIMEZONE

  const attribution: Record<string, string> = {}
  for (const key of ATTRIBUTION_KEYS) {
    const value = firstParam(query[key])?.trim()
    if (value && value.length <= 200) attribution[key] = value
  }
  // On a landing page the page itself is the source. On /book, an explicit ?source= wins, then the campaign tag.
  const sourceParam = firstParam(query.source)?.trim().slice(0, 100)
  const source = basePath !== '/book' ? basePath.slice(0, 100) : sourceParam || (attribution.utm_campaign ?? '').slice(0, 100)

  const href = (step: { day?: string; startsAt?: string }) => {
    const search = new URLSearchParams(attribution)
    if (tz) search.set('tz', tz)
    if (sourceParam) search.set('source', sourceParam)
    if (step.day) search.set('day', step.day)
    if (step.startsAt) search.set('startsAt', step.startsAt)
    const qs = search.toString()
    return (qs ? `${basePath}?${qs}` : basePath) + anchor
  }

  const slots = await getAvailableSlots()
  const { days, day, selected } = resolveSteps(slots, zone, firstParam(query.day), firstParam(query.startsAt))
  const step = selected ? 2 : 1
  const back = selected && day ? { href: href({ day: day.date }), label: 'Back to times' } : null
  // Choosing another day keeps the heading where it is. The details step is keyed on the chosen time alone: a time zone change can move its date, and must not pull focus off the Change control.
  const stepKey = selected ? `2:${selected.startsAt}` : '1'

  const frame = (children: ReactNode, nav = true) => (
    <div className="bk-flow">
      {standalone && <BookingFlowStyles />}
      <VisitorTimezone current={tz} />
      {nav && (
        <div className="bk-flow-nav">
          <p className="bk-flow-step">Step {step} of 2</p>
          {back && <Link className="bk-textlink" href={back.href} prefetch={false} scroll={false}>{back.label}</Link>}
        </div>
      )}
      {children}
    </div>
  )

  if (days.length === 0) {
    return frame(
      <>
        <StepHeading level={headingLevel}>No times are open right now.</StepHeading>
        <p className="bk-copy">My calendar is full for the next couple of weeks. Send me a message instead, tell me what you sell and what isn’t working, and I’ll find a time to talk.</p>
        <div className="bk-actions">
          <WhatsAppLink className="bk-button">Message me on WhatsApp</WhatsAppLink>
          <a className="bk-textlink" href="mailto:alexandergrantapp@gmail.com?subject=A%2015%20minute%20call" style={{ overflowWrap: 'anywhere' }}>alexandergrantapp@gmail.com</a>
        </div>
      </>,
      false,
    )
  }

  if (!selected) {
    const shown = day ?? days[0]
    return frame(
      <>
        <StepHeading key={stepKey} level={headingLevel}>Pick a day and time</StepHeading>
        <TimezonePicker current={zone} />
        <CalendarPicker
          keepScroll
          level={headingLevel}
          days={days.map(d => ({ date: d.date, href: href({ day: d.date }), label: formatDayLong(d.slots[0].startsAt, zone), count: d.slots.length }))}
          selected={shown.date}
          today={zoneDate(new Date(), zone)}
          dayLabel={formatDayLong(shown.slots[0].startsAt, zone)}
          slots={shown.slots.map(s => ({ href: href({ day: shown.date, startsAt: s.startsAt }), label: formatTime(s.startsAt, zone) }))}
        />
      </>,
    )
  }

  const dayLong = formatDayLong(selected.startsAt, zone)
  const time = formatTime(selected.startsAt, zone)
  return frame(
    <>
      <BookingSummary rows={[{ label: 'Day', value: dayLong }, { label: 'Time', value: time }, { label: 'Length', value: `${CALL_MINUTES} minutes` }]} />
      <TimezonePicker current={zone} />
      <div style={{ marginTop: 32 }}>
        <StepHeading key={stepKey} level={headingLevel}>Your details</StepHeading>
      </div>
      <BookForm
        startsAt={selected.startsAt}
        timezone={zone}
        source={source}
        attribution={attribution}
        startedAt={Date.now()}
        submitLabel={`Book ${formatWeekday(selected.startsAt, zone)} at ${time}`}
        chooseTimeHref={href({ day: zoneDate(selected.startsAt, zone) })}
        smsEnabled={smsRemindersEnabled()}
      />
    </>,
  )
}
