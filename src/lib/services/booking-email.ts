import { Resend } from 'resend'
import { formatWhen, zoneCity } from '@/lib/time'

/**
 * Emails for intro call bookings. Every send is best effort and never throws:
 * they run after the response, where nobody could act on a failure. Pure
 * builders (bookingIcs, googleCalendarTemplateUrl) do no I/O.
 */

const FROM = 'Alexander Grant <alex@alexandergrant.app>'
const REPLY_TO = 'alexandergrantapp@gmail.com'

/** The booking as the emails read it. A CallBooking row fits as is. */
export type BookingEmailData = {
  id: string
  startsAt: Date
  endsAt: Date
  name: string
  email: string
  business: string
  need: string
  timezone: string
  meetingUrl: string | null
  source: string | null
}

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || 'https://alexandergrant.app').replace(/\/+$/, '')
}

const TITLE = 'Intro call with Alex Grant'

function meetingLine(meetingUrl: string | null): string {
  return meetingUrl ? `Join here: ${meetingUrl}` : 'Alex will email you the call link before the call.'
}

function firstWord(name: string): string {
  return name.trim().split(/\s+/)[0] ?? ''
}

function utcStamp(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
}

export function googleCalendarTemplateUrl(params: { title: string; start: Date; end: Date; details: string; location: string }): string {
  const query = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    dates: `${utcStamp(params.start)}/${utcStamp(params.end)}`,
    details: params.details,
    location: params.location,
  })
  return `https://calendar.google.com/calendar/render?${query.toString()}`
}

/** RFC 5545 folds content lines at 75 octets, continuing with a leading space. */
function foldLine(line: string): string {
  const out: string[] = []
  let current = ''
  let bytes = 0
  for (const char of line) {
    const size = Buffer.byteLength(char)
    const limit = out.length === 0 ? 75 : 74
    if (bytes + size > limit) {
      out.push(current)
      current = ''
      bytes = 0
    }
    current += char
    bytes += size
  }
  out.push(current)
  return out.join('\r\n ')
}

function icsText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/** One VEVENT in UTC, so the calendar app shows it in the viewer's own zone. */
export function bookingIcs(booking: Pick<BookingEmailData, 'id' | 'startsAt' | 'endsAt' | 'meetingUrl'>, manageUrl: string, now = new Date()): string {
  const description = [meetingLine(booking.meetingUrl), manageUrl ? `Change or cancel: ${manageUrl}` : ''].filter(Boolean).join('\n')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Alexander Grant//Intro calls//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.id}@alexandergrant.app`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${utcStamp(booking.startsAt)}`,
    `DTEND:${utcStamp(booking.endsAt)}`,
    `SUMMARY:${icsText(TITLE)}`,
    `LOCATION:${icsText(booking.meetingUrl ?? '')}`,
    `DESCRIPTION:${icsText(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return `${lines.map(foldLine).join('\r\n')}\r\n`
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c)
}

/** Header-safe: a name typed with a line break must not end up as a broken subject. */
function oneLine(s: string): string {
  return s.replace(/[\r\n]+/g, ' ').trim()
}

function zoneLabel(timezone: string): string {
  return `${zoneCity(timezone)} time`
}

type Message = { to: string; subject: string; html: string; text: string; replyTo: string; ics?: string }

async function send(message: Message, label: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn(`[booking-email] RESEND_API_KEY not set, ${label} not sent`)
    return
  }
  try {
    const { error } = await new Resend(apiKey).emails.send({
      from: FROM,
      to: message.to,
      replyTo: message.replyTo,
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(message.ics ? { attachments: [{ filename: 'intro-call.ics', content: Buffer.from(message.ics), contentType: 'text/calendar' }] } : {}),
    })
    if (error) console.warn(`[booking-email] ${label} failed`, error.message)
  } catch (err) {
    console.warn(`[booking-email] ${label} failed`, err)
  }
}

function layout(paragraphs: string[], button?: { label: string; url: string }, footer?: string): string {
  const body = paragraphs.map(p => `<p style="color: #444; line-height: 1.5;">${p}</p>`).join('')
  const cta = button
    ? `<p style="margin: 28px 0;"><a href="${escapeHtml(button.url)}" style="background: #1a1a2e; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">${escapeHtml(button.label)}</a></p>`
    : ''
  const foot = footer ? `<p style="color: #bbb; font-size: 0.8em; margin-top: 32px;">${footer}</p>` : ''
  return `<div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 20px;">${body}${cta}${foot}</div>`
}

function link(url: string, label = url): string {
  return `<a href="${escapeHtml(url)}" style="color: #1a1a2e;">${escapeHtml(label)}</a>`
}

/** The visitor's confirmation: time in their zone, call link, Google Calendar button, .ics, and the manage link. */
export async function sendVisitorConfirmation(booking: BookingEmailData, manageUrl: string, moved = false): Promise<void> {
  const when = `${formatWhen(booking.startsAt, booking.timezone)} (${zoneLabel(booking.timezone)})`
  const calendarUrl = googleCalendarTemplateUrl({
    title: TITLE,
    start: booking.startsAt,
    end: booking.endsAt,
    details: [meetingLine(booking.meetingUrl), manageUrl ? `Change or cancel: ${manageUrl}` : ''].filter(Boolean).join('\n'),
    location: booking.meetingUrl ?? '',
  })
  const heading = moved ? 'Your call with Alex has moved' : 'Your call with Alex is booked'
  const changeText = manageUrl
    ? `Need to change or cancel it? Use this link: ${manageUrl}`
    : 'Need to change or cancel it? Just reply to this email.'
  const changeHtml = manageUrl ? `Need to change or cancel it? ${link(manageUrl, 'Change or cancel your call')}.` : escapeHtml(changeText)
  const movedNote = moved ? 'If you added the old time to your calendar, remove it.' : ''

  await send(
    {
      to: booking.email,
      replyTo: REPLY_TO,
      subject: heading,
      ics: bookingIcs(booking, manageUrl),
      text: [
        `Hi ${firstWord(booking.name)},`,
        `${moved ? 'Your 15 minute intro call is now on' : 'Your 15 minute intro call is booked for'} ${when}.`,
        meetingLine(booking.meetingUrl),
        movedNote,
        `Add it to Google Calendar: ${calendarUrl}`,
        changeText,
        'Alex',
      ]
        .filter(Boolean)
        .join('\n\n'),
      html: layout(
        [
          `Hi ${escapeHtml(firstWord(booking.name))},`,
          `${moved ? 'Your 15 minute intro call is now on' : 'Your 15 minute intro call is booked for'} <strong>${escapeHtml(when)}</strong>.`,
          booking.meetingUrl ? `Join here: ${link(booking.meetingUrl)}` : escapeHtml(meetingLine(null)),
          ...(movedNote ? [movedNote] : []),
          changeHtml,
        ],
        { label: 'Add to Google Calendar', url: calendarUrl },
        'Alexander Grant · alexandergrant.app<br />There is a calendar file attached for Apple Calendar and Outlook.',
      ),
    },
    `confirmation for booking ${booking.id}`,
  )
}

/** Tells the visitor their call is off, with a link to book again. `by` says who cancelled. */
export async function sendVisitorCancellation(booking: BookingEmailData, by: 'visitor' | 'owner'): Promise<void> {
  const when = `${formatWhen(booking.startsAt, booking.timezone)} (${zoneLabel(booking.timezone)})`
  const bookUrl = `${appUrl()}/book`
  const lead =
    by === 'visitor'
      ? `Your intro call on ${when} is cancelled.`
      : `Sorry, Alex has had to cancel your intro call on ${when}.`
  await send(
    {
      to: booking.email,
      replyTo: REPLY_TO,
      subject: 'Your call with Alex is cancelled',
      text: [`Hi ${firstWord(booking.name)},`, lead, `If you would like to pick another time: ${bookUrl}`, 'Alex'].join('\n\n'),
      html: layout(
        [`Hi ${escapeHtml(firstWord(booking.name))},`, escapeHtml(lead), 'If you would like to pick another time, you can do that here.'],
        { label: 'Pick another time', url: bookUrl },
      ),
    },
    `cancellation for booking ${booking.id}`,
  )
}

/** Alex's notice of a booking, a move or a cancellation, replying to the visitor. Skipped when no address is configured. */
export async function sendOwnerNotice(
  booking: BookingEmailData,
  event: { kind: 'booked' } | { kind: 'moved'; from: Date } | { kind: 'cancelled' },
  ownerTimezone: string,
): Promise<void> {
  const to = process.env.BOOKING_NOTIFY_EMAIL || process.env.VOICE_NOTIFY_EMAIL
  if (!to) {
    console.warn(`[booking-email] no BOOKING_NOTIFY_EMAIL or VOICE_NOTIFY_EMAIL, notice for booking ${booking.id} not sent`)
    return
  }

  const ownerWhen = `${formatWhen(booking.startsAt, ownerTimezone)} ${zoneLabel(ownerTimezone)}`
  const visitorWhen = `${formatWhen(booking.startsAt, booking.timezone)} ${zoneLabel(booking.timezone)}`
  const verb = event.kind === 'booked' ? 'booked' : event.kind === 'moved' ? 'moved' : 'cancelled'
  const subject = oneLine(`Intro call ${verb}: ${booking.name}, ${booking.business}`)

  const rows: [string, string][] = [
    ['When', ownerWhen],
    ...(booking.timezone !== ownerTimezone ? [['Their time', visitorWhen] as [string, string]] : []),
    ...(event.kind === 'moved' ? [['Was', `${formatWhen(event.from, ownerTimezone)} ${zoneLabel(ownerTimezone)}`] as [string, string]] : []),
    ['Name', booking.name],
    ['Email', booking.email],
    ['Business', booking.business],
    ['Wants to talk about', booking.need || '(left blank)'],
    ...(booking.source ? [['Source', booking.source] as [string, string]] : []),
  ]
  const dashboard = `${appUrl()}/dashboard/bookings`

  await send(
    {
      to,
      replyTo: booking.email,
      subject,
      text: [...rows.map(([k, v]) => `${k}: ${v}`), '', dashboard].join('\n'),
      html: layout(
        [
          `<strong>${escapeHtml(booking.name)}</strong> ${verb} an intro call.`,
          `<table style="border-collapse: collapse;">${rows
            .map(
              ([k, v]) =>
                `<tr><td style="color: #999; padding: 4px 16px 4px 0; vertical-align: top;">${escapeHtml(k)}</td><td style="color: #1a1a2e; padding: 4px 0; white-space: pre-wrap;">${escapeHtml(v)}</td></tr>`,
            )
            .join('')}</table>`,
        ],
        { label: 'Open bookings', url: dashboard },
      ),
    },
    `owner notice (${verb}) for booking ${booking.id}`,
  )
}
