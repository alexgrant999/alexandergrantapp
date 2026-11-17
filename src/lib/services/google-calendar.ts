import crypto from 'node:crypto'
import { z } from 'zod'

/**
 * Alex's Google Calendar, through a service account the calendar is shared
 * with. Busy time comes in through freeBusy; each booking goes out as an
 * event. When any env var is missing every function is a no-op, and nothing
 * here ever throws: busy time fails open (hours and time off still apply) and
 * event writes run after the response, where nobody could act on a failure.
 *
 * Env: GOOGLE_CALENDAR_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL,
 * GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (PEM; literal \n sequences become newlines).
 */

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const API = 'https://www.googleapis.com/calendar/v3'
const SCOPE = 'https://www.googleapis.com/auth/calendar'
const BUSY_TIMEOUT_MS = 3_000
const WRITE_TIMEOUT_MS = 10_000
const BUSY_CACHE_MS = 60_000
const TOKEN_EARLY_EXPIRY_MS = 60_000

export type BusyBlock = { startsAt: Date; endsAt: Date }

type Config = { calendarId: string; clientEmail: string; privateKey: string }

function config(): Config | null {
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim()
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim()
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n').trim()
  if (!calendarId || !clientEmail || !privateKey) return null
  return { calendarId, clientEmail, privateKey }
}

const tokenResponse = z.object({ access_token: z.string().min(1), expires_in: z.number().positive() })

const freeBusyResponse = z.object({
  calendars: z
    .record(
      z.string(),
      z.object({
        busy: z.array(z.object({ start: z.string(), end: z.string() })).optional(),
        errors: z.array(z.object({ domain: z.string().optional(), reason: z.string().optional() })).optional(),
      }),
    )
    .optional(),
})

const eventResponse = z.object({ id: z.string().min(1) })

let cachedToken: { value: string; expiresAt: number } | null = null

/** An RS256 JWT bearer grant, cached until a minute before it expires. */
async function accessToken(cfg: Config, signal: AbortSignal): Promise<string> {
  if (cachedToken && cachedToken.expiresAt - TOKEN_EARLY_EXPIRY_MS > Date.now()) return cachedToken.value

  const iat = Math.floor(Date.now() / 1000)
  const encode = (part: object) => Buffer.from(JSON.stringify(part)).toString('base64url')
  const unsigned = `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ iss: cfg.clientEmail, scope: SCOPE, aud: TOKEN_URL, iat, exp: iat + 3600 })}`
  const signature = crypto.sign('RSA-SHA256', Buffer.from(unsigned), cfg.privateKey).toString('base64url')

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${signature}` }),
    signal,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`token exchange ${res.status}: ${(await res.text()).slice(0, 200)}`)

  const body = tokenResponse.parse(await res.json())
  cachedToken = { value: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 }
  return body.access_token
}

async function calendarFetch(cfg: Config, path: string, init: { method: string; body?: unknown }, timeoutMs: number): Promise<Response> {
  const signal = AbortSignal.timeout(timeoutMs)
  const token = await accessToken(cfg, signal)
  return fetch(`${API}${path}`, {
    method: init.method,
    headers: { Authorization: `Bearer ${token}`, ...(init.body ? { 'Content-Type': 'application/json' } : {}) },
    body: init.body ? JSON.stringify(init.body) : undefined,
    signal,
    cache: 'no-store',
  })
}

async function fetchBusy(cfg: Config, from: Date, to: Date): Promise<BusyBlock[]> {
  try {
    const res = await calendarFetch(
      cfg,
      '/freeBusy',
      { method: 'POST', body: { timeMin: from.toISOString(), timeMax: to.toISOString(), items: [{ id: cfg.calendarId }] } },
      BUSY_TIMEOUT_MS,
    )
    if (!res.ok) throw new Error(`freeBusy ${res.status}: ${(await res.text()).slice(0, 200)}`)

    const calendars = freeBusyResponse.parse(await res.json()).calendars ?? {}
    const calendar = calendars[cfg.calendarId] ?? Object.values(calendars)[0]
    if (!calendar) throw new Error('freeBusy returned no calendar')
    if (calendar.errors?.length) throw new Error(`freeBusy calendar error: ${calendar.errors.map(e => e.reason ?? 'unknown').join(', ')}`)

    return (calendar.busy ?? [])
      .map(period => ({ startsAt: new Date(period.start), endsAt: new Date(period.end) }))
      .filter(block => !Number.isNaN(block.startsAt.getTime()) && block.endsAt > block.startsAt)
  } catch (err) {
    console.warn('[google-calendar] busy lookup failed, slots show without calendar busy time', err instanceof Error ? err.message : err)
    return []
  }
}

let busyCache: { key: string; expiresAt: number; result: Promise<BusyBlock[]> } | null = null

/**
 * Busy time on Alex's calendar in [from, to). One request per range per 60
 * seconds, shared by concurrent callers. A failure is cached for the same 60
 * seconds, so an outage logs once a minute and costs one 3 second wait, not
 * one per page view.
 */
export async function getCalendarBusy(from: Date, to: Date): Promise<BusyBlock[]> {
  const cfg = config()
  if (!cfg) return []

  const key = `${from.toISOString()}|${to.toISOString()}`
  const now = Date.now()
  if (busyCache && busyCache.key === key && busyCache.expiresAt > now) return busyCache.result

  const result = fetchBusy(cfg, from, to)
  busyCache = { key, expiresAt: now + BUSY_CACHE_MS, result }
  return result
}

/**
 * The event id for a booking. Google lets the caller choose it (base32hex,
 * 5 to 1024 characters), and a hex digest fits, so a cancel can delete the
 * event by booking id even before the create has saved the id it got back.
 */
export function calendarEventIdFor(bookingId: string): string {
  return `cb${crypto.createHash('sha256').update(`booking:${bookingId}`).digest('hex').slice(0, 40)}`
}

/**
 * Puts the booking on Alex's calendar. No attendees: a service account cannot
 * invite people. Returns the event id, or null when not configured or on any
 * failure. A 409 means the event already exists from an earlier attempt.
 */
export async function createCalendarEvent(
  booking: { id: string; startsAt: Date; endsAt: Date; name: string; email: string; business: string; need: string; timezone: string; meetingUrl: string | null },
  manageUrl: string,
): Promise<string | null> {
  const cfg = config()
  if (!cfg) return null

  const eventId = calendarEventIdFor(booking.id)
  const description = [
    booking.need ? `Wants to talk about:\n${booking.need}` : '',
    `Email: ${booking.email}`,
    `Their time zone: ${booking.timezone}`,
    manageUrl ? `Change or cancel: ${manageUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  try {
    const res = await calendarFetch(
      cfg,
      `/calendars/${encodeURIComponent(cfg.calendarId)}/events`,
      {
        method: 'POST',
        body: {
          id: eventId,
          summary: `Intro call: ${booking.name}, ${booking.business}`.replace(/[\r\n]+/g, ' '),
          description,
          ...(booking.meetingUrl ? { location: booking.meetingUrl } : {}),
          start: { dateTime: booking.startsAt.toISOString() },
          end: { dateTime: booking.endsAt.toISOString() },
          extendedProperties: { private: { callBookingId: booking.id } },
        },
      },
      WRITE_TIMEOUT_MS,
    )
    if (res.status === 409) return eventId
    if (res.status === 403) {
      console.warn(`[google-calendar] no write access to the calendar (shared as free and busy only?), booking ${booking.id} not added`)
      return null
    }
    if (!res.ok) throw new Error(`events.insert ${res.status}: ${(await res.text()).slice(0, 200)}`)
    return eventResponse.parse(await res.json()).id
  } catch (err) {
    console.warn(`[google-calendar] could not add booking ${booking.id}`, err instanceof Error ? err.message : err)
    return null
  }
}

/** Removes an event. Already gone (404, 410) is success; no write access (403) is logged and ignored. */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  const cfg = config()
  if (!cfg) return

  try {
    const res = await calendarFetch(
      cfg,
      `/calendars/${encodeURIComponent(cfg.calendarId)}/events/${encodeURIComponent(eventId)}`,
      { method: 'DELETE' },
      WRITE_TIMEOUT_MS,
    )
    if (res.ok || res.status === 404 || res.status === 410) return
    if (res.status === 403) {
      console.warn(`[google-calendar] no write access to the calendar, event ${eventId} not removed`)
      return
    }
    throw new Error(`events.delete ${res.status}: ${(await res.text()).slice(0, 200)}`)
  } catch (err) {
    console.warn(`[google-calendar] could not remove event ${eventId}`, err instanceof Error ? err.message : err)
  }
}
