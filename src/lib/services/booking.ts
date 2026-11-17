import crypto from 'node:crypto'
import type { CallBooking, Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { computeSlots, subtractSpan, type Span } from '@/lib/schedule-windows'
import { localParts, shiftDate, zonedTimeToUtc } from '@/lib/time'
import { ATTRIBUTION_KEYS, normalisePhone, type BookCallInput, type TimeOffInput } from '@/lib/validators/booking'
import { appUrl, sendOwnerNotice, sendVisitorCancellation, sendVisitorConfirmation } from '@/lib/services/booking-email'
import { cancelReminders, scheduleReminders } from '@/lib/services/booking-reminders'
import { calendarEventIdFor, createCalendarEvent, deleteCalendarEvent, getCalendarBusy } from '@/lib/services/google-calendar'

/**
 * Public intro call booking, ported from the Teddy Calls engine for one owner.
 * Availability is weekly hours (AvailabilityRule) minus existing calls, time
 * off and busy time on Alex's Google Calendar, each with a buffer. Every write that could race another booking runs
 * under one Postgres advisory lock, so the slot check and the insert are a
 * single step as far as any other booking can tell.
 *
 * Server only: this module imports Prisma. Client components get these
 * constants as props from a server component.
 */

export const OWNER_TIMEZONE = 'America/New_York'
export const CALL_MINUTES = 15
export const SLOT_STEP_MINUTES = 30
export const BUFFER_MINUTES = 15
export const NOTICE_MINUTES = 12 * 60
export const HORIZON_DAYS = 14
export const MAX_CALLS_PER_DAY = 4

/** Brakes on form abuse, not business rules. Every booking sends two emails, so these also cap mail per sender and recipient. */
export const MAX_BOOKINGS_PER_IP_PER_HOUR = 3
export const MAX_UPCOMING_PER_EMAIL = 1
/** Counts reschedules too, since each one is a new row and a new email. */
export const MAX_BOOKINGS_PER_EMAIL_PER_DAY = 4
export const MAX_NEW_BOOKINGS_PER_DAY = 20

/** The thanks page link (?b=<id>) stops showing the booking after this long. */
export const PUBLIC_BOOKING_MAX_AGE_MINUTES = 120

const LOCK_KEY = 'call-booking'
const MAX_CHAIN_HOPS = 20
const TX_OPTIONS = { maxWait: 5_000, timeout: 10_000 }

export type Slot = { startsAt: string; endsAt: string }

export type PublicBooking = {
  id: string
  startsAt: string
  endsAt: string
  status: 'BOOKED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW'
  firstName: string
  timezone: string
  meetingUrl: string | null
}

export type DashboardBooking = PublicBooking & {
  name: string
  email: string
  business: string
  need: string
  source: string | null
  attribution: Record<string, string> | null
  createdAt: string
}

export type WeeklyHours = { dayOfWeek: number; startTime: string; endTime: string }[]

export type TimeOffBlock = { id: string; startsAt: string; endsAt: string; note: string | null }

/**
 * Runs a side effect (the emails). Server actions pass next/server's after(),
 * so mail goes out once the response is sent; without one the task is awaited.
 */
export type Defer = (task: () => Promise<void>) => void

async function dispatch(task: () => Promise<void>, defer?: Defer): Promise<void> {
  if (defer) defer(task)
  else await task()
}

/** Thrown for dashboard input that passed the schema but still makes no sense (time off ending before it starts). */
export class BookingInputError extends Error {}

/** Signals a rollback inside a transaction that has already written. */
class SlotTakenError extends Error {}

type Db = Prisma.TransactionClient

/** Serialises every booking, reschedule and hours change. The second caller waits here, then sees the first one's rows. */
async function lock(tx: Db): Promise<void> {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${LOCK_KEY}))`
}

/** The dates slots are offered on, and the instants that bracket them with a day either side. */
function slotRange(now: Date) {
  const fromDate = localParts(OWNER_TIMEZONE, now).date
  return {
    fromDate,
    rangeStart: zonedTimeToUtc(shiftDate(fromDate, -1), '00:00', OWNER_TIMEZONE),
    rangeEnd: zonedTimeToUtc(shiftDate(fromDate, HORIZON_DAYS + 1), '00:00', OWNER_TIMEZONE),
  }
}

/**
 * Every block that makes Alex unavailable on top of existing calls, for
 * [from, to). The one place busy time is gathered: time off, and busy time on
 * Alex's Google Calendar. `ownEvent` is the span of a booking being moved,
 * taken out of the calendar's busy time so that booking's own event does not
 * block it (the booking row is already left out of `existing`).
 */
async function busyBlocks(db: Db, from: Date, to: Date, ownEvent: Span | null): Promise<Span[]> {
  const timeOff = await db.timeOff.findMany({ where: { startsAt: { lt: to }, endsAt: { gt: from } }, select: { startsAt: true, endsAt: true } })
  const calendar = subtractSpan(await getCalendarBusy(from, to), ownEvent)
  return [...timeOff, ...calendar]
}

/**
 * Fetches calendar busy time for the range openSlots will ask for, so the
 * call to Google happens before the advisory lock is taken. Inside the lock
 * the same request is answered from the 60 second cache.
 */
async function warmCalendarBusy(now: Date): Promise<void> {
  const { rangeStart, rangeEnd } = slotRange(now)
  await getCalendarBusy(rangeStart, rangeEnd)
}

/** Open slots from today in Alex's zone. `excludeId` leaves one booking out, for the reschedule picker. */
async function openSlots(db: Db, now: Date, excludeId?: string): Promise<Span[]> {
  const rules = await db.availabilityRule.findMany({ select: { dayOfWeek: true, startTime: true, endTime: true, timezone: true } })
  if (rules.length === 0) return []

  const { fromDate, rangeStart, rangeEnd } = slotRange(now)

  // Sequential, not Promise.all: these may run inside an interactive transaction.
  // Completed and no-show calls still count toward the day's cap; only cancelled ones free it.
  const existing = await db.callBooking.findMany({
    where: { startsAt: { lt: rangeEnd }, endsAt: { gt: rangeStart }, status: { not: 'CANCELLED' }, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { startsAt: true, endsAt: true },
  })
  const moving = excludeId ? await db.callBooking.findUnique({ where: { id: excludeId }, select: { startsAt: true, endsAt: true } }) : null
  const busy = await busyBlocks(db, rangeStart, rangeEnd, moving)

  return computeSlots({
    rules,
    existing,
    busy,
    durationMinutes: CALL_MINUTES,
    bufferMinutes: BUFFER_MINUTES,
    leadMinutes: NOTICE_MINUTES,
    stepMinutes: SLOT_STEP_MINUTES,
    maxPerDay: MAX_CALLS_PER_DAY,
    timezone: OWNER_TIMEZONE,
    now,
    fromDate,
    days: HORIZON_DAYS,
  })
}

function offered(slots: { startsAt: Date }[], startsAt: Date): boolean {
  return slots.some(slot => slot.startsAt.getTime() === startsAt.getTime())
}

/**
 * Bookable slots for the public page. Empty when no weekly hours are set.
 * Pass the id of a booking being moved so it does not block times next to itself.
 */
export async function getAvailableSlots(options?: { excludeBookingId?: string }): Promise<Slot[]> {
  const slots = await openSlots(prisma, new Date(), options?.excludeBookingId)
  return slots.map(slot => ({ startsAt: slot.startsAt.toISOString(), endsAt: slot.endsAt.toISOString() }))
}

/** Salted so the stored value cannot be reversed by hashing every IPv4 address. For rate limiting only. */
function hashIp(ip: string | null): string | null {
  if (!ip) return null
  return crypto
    .createHmac('sha256', process.env.SESSION_SECRET ?? '')
    .update(`ip:${ip}`)
    .digest('hex')
    .slice(0, 32)
}

/**
 * Honeypot filled: a bot, which the action pretends succeeded. Sent under 3
 * seconds after the form rendered: "too_fast", which can be a real visitor
 * with autofill, so the action saves nothing and asks them to press Book
 * again (the form keeps its original startedAt, so the second press passes).
 * A load time over a day old is "stale": the visitor left the tab open and is
 * asked to refresh. A load time in the future is let through, since it only
 * means the clock that stamped it is ahead.
 */
export function botCheck(input: { website: string; startedAt: number }, now: number): 'bot' | 'too_fast' | 'stale' | null {
  if (input.website.trim() !== '') return 'bot'
  const elapsed = now - input.startedAt
  if (elapsed > 24 * 60 * 60_000) return 'stale'
  if (elapsed >= 0 && elapsed < 3_000) return 'too_fast'
  return null
}

function meetingUrlFromEnv(): string | null {
  return process.env.BOOKING_MEETING_URL?.trim() || null
}

// Manage links: `<bookingId>.<hmac>` over `booking:<bookingId>`, signed with
// SESSION_SECRET. Nothing is stored. A reschedule makes a new row pointing
// back at the old one, and lookups follow that chain, so an old link stays good.

function signature(bookingId: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(`booking:${bookingId}`).digest('base64url')
}

export function signManageToken(bookingId: string): string | null {
  const secret = process.env.SESSION_SECRET
  if (!secret || !bookingId) return null
  return `${bookingId}.${signature(bookingId, secret)}`
}

/** The booking id a token names, or null when it is malformed, forged, or no secret is set. */
export function verifyManageToken(token: string): string | null {
  const secret = process.env.SESSION_SECRET
  if (!secret || !token) return null
  const parts = token.split('.')
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null
  const [bookingId, given] = parts

  const expected = Buffer.from(signature(bookingId, secret))
  const actual = Buffer.from(given)
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null
  return bookingId
}

/** The full manage link, or "" when links cannot be signed (the emails then say to reply instead). */
export function manageUrlFor(bookingId: string): string {
  const token = signManageToken(bookingId)
  return token ? `${appUrl()}/book/manage/${token}` : ''
}

/**
 * Writes the booking onto Alex's calendar and records the event id. If the
 * booking was cancelled while the event was being made, the event comes
 * straight back off, so a fast cancel never leaves an orphan blocking the slot.
 */
async function addToCalendar(booking: CallBooking): Promise<void> {
  try {
    const eventId = await createCalendarEvent(booking, manageUrlFor(booking.id))
    if (!eventId) return
    const saved = await prisma.callBooking.updateMany({ where: { id: booking.id, status: 'BOOKED' }, data: { googleEventId: eventId } })
    if (saved.count === 0) await deleteCalendarEvent(eventId)
  } catch (err) {
    console.warn(`[booking] calendar sync for booking ${booking.id} failed`, err)
  }
}

/** The event id is derived from the booking id, so this works even if the create has not saved it yet. */
function removeFromCalendar(booking: Pick<CallBooking, 'id' | 'googleEventId'>): Promise<void> {
  return deleteCalendarEvent(booking.googleEventId ?? calendarEventIdFor(booking.id))
}

/** The latest booking in the token's reschedule chain. */
async function resolveToken(token: string): Promise<CallBooking | null> {
  const id = verifyManageToken(token)
  if (!id) return null
  let booking = await prisma.callBooking.findUnique({ where: { id } })
  for (let hop = 0; booking && booking.status === 'CANCELLED' && hop < MAX_CHAIN_HOPS; hop++) {
    const next = await prisma.callBooking.findUnique({ where: { rescheduledFromId: booking.id } })
    if (!next) break
    booking = next
  }
  return booking
}

function firstNameOf(name: string): string {
  const first = name.trim().split(/\s+/)[0] ?? ''
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : ''
}

function toPublic(booking: CallBooking): PublicBooking {
  return {
    id: booking.id,
    startsAt: booking.startsAt.toISOString(),
    endsAt: booking.endsAt.toISOString(),
    status: booking.status,
    firstName: firstNameOf(booking.name),
    timezone: booking.timezone,
    meetingUrl: booking.meetingUrl,
  }
}

/** The non-empty ad click ids and UTM tags from the form, or null when there were none. */
function attributionOf(input: BookCallInput): Record<string, string> | null {
  const found = ATTRIBUTION_KEYS.flatMap(key => {
    const value = input[key]
    return value ? [[key, value] as const] : []
  })
  return found.length > 0 ? Object.fromEntries(found) : null
}

/** The stored attribution as a flat string map; anything else in the column is ignored. */
function readAttribution(value: Prisma.JsonValue | null): Record<string, string> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const entries = Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === 'string')
  return entries.length > 0 ? Object.fromEntries(entries) : null
}

function toDashboard(booking: CallBooking): DashboardBooking {
  return {
    ...toPublic(booking),
    name: booking.name,
    email: booking.email,
    business: booking.business,
    need: booking.need,
    source: booking.source,
    attribution: readAttribution(booking.attribution),
    createdAt: booking.createdAt.toISOString(),
  }
}

type BookResult = { ok: true; bookingId: string } | { ok: false; error: 'slot_taken' | 'rate_limited' | 'paused' | 'invalid' }

/**
 * Books a call at `input.startsAt` if that exact slot is on offer right now.
 * Under the lock: rate limits (per IP hash and per recipient email give
 * 'rate_limited'; the overall daily brake gives 'paused'), then the full slot
 * check, then the insert. The confirmation and Alex's
 * notice go out through `meta.defer`.
 */
export async function bookCall(input: BookCallInput, meta: { ip: string | null; defer?: Defer }): Promise<BookResult> {
  const startsAt = new Date(input.startsAt)
  if (Number.isNaN(startsAt.getTime())) return { ok: false, error: 'invalid' }

  const now = new Date()
  const hourAgo = new Date(now.getTime() - 60 * 60_000)
  const dayAgo = new Date(now.getTime() - 24 * 60 * 60_000)
  const ipHash = hashIp(meta.ip)
  await warmCalendarBusy(now)

  const result = await prisma.$transaction(async tx => {
    await lock(tx)

    const byIp = ipHash ? await tx.callBooking.count({ where: { ipHash, createdAt: { gte: hourAgo } } }) : 0
    const upcomingForEmail = await tx.callBooking.count({ where: { email: input.email, status: 'BOOKED', startsAt: { gt: now } } })
    const todayForEmail = await tx.callBooking.count({ where: { email: input.email, createdAt: { gte: dayAgo } } })
    const todayOverall = await tx.callBooking.count({ where: { createdAt: { gte: dayAgo } } })
    if (byIp >= MAX_BOOKINGS_PER_IP_PER_HOUR || upcomingForEmail >= MAX_UPCOMING_PER_EMAIL || todayForEmail >= MAX_BOOKINGS_PER_EMAIL_PER_DAY) {
      return { ok: false, error: 'rate_limited' } as const
    }
    // The overall brake is not the visitor's doing, so it gets its own error and a neutral message.
    if (todayOverall >= MAX_NEW_BOOKINGS_PER_DAY) return { ok: false, error: 'paused' } as const

    if (!offered(await openSlots(tx, now), startsAt)) return { ok: false, error: 'slot_taken' } as const

    const booking = await tx.callBooking.create({
      data: {
        startsAt,
        endsAt: new Date(startsAt.getTime() + CALL_MINUTES * 60_000),
        name: input.name,
        email: input.email,
        business: input.business,
        need: input.need,
        timezone: input.timezone || OWNER_TIMEZONE,
        meetingUrl: meetingUrlFromEnv(),
        source: input.source ?? null,
        attribution: attributionOf(input) ?? undefined,
        ipHash,
        phone: input.smsConsent ? normalisePhone(input.phone) : null,
        smsConsentAt: input.smsConsent ? now : null,
      },
    })
    return { ok: true, booking } as const
  }, TX_OPTIONS)

  if (!result.ok) return result
  const { booking } = result

  await dispatch(async () => {
    await Promise.all([
      sendVisitorConfirmation(booking, manageUrlFor(booking.id)),
      sendOwnerNotice(booking, { kind: 'booked' }, OWNER_TIMEZONE),
      addToCalendar(booking),
      scheduleReminders(booking, manageUrlFor(booking.id)),
    ])
  }, meta.defer)

  return { ok: true, bookingId: booking.id }
}

/**
 * For the thanks page. Anyone holding the id sees the first name, time and
 * call link, nothing else, and only for PUBLIC_BOOKING_MAX_AGE_MINUTES after
 * booking. Later visits go through the manage link instead.
 */
export async function getPublicBooking(bookingId: string): Promise<PublicBooking | null> {
  const booking = await prisma.callBooking.findUnique({ where: { id: bookingId } })
  if (!booking || Date.now() - booking.createdAt.getTime() > PUBLIC_BOOKING_MAX_AGE_MINUTES * 60_000) return null
  return toPublic(booking)
}

/** The latest booking the manage token leads to, following reschedules. Null for a bad token. */
export async function getBookingByToken(token: string): Promise<PublicBooking | null> {
  const booking = await resolveToken(token)
  return booking ? toPublic(booking) : null
}

/** Cancels the booking the token leads to, if it is still booked and ahead. One atomic claim, so a double click emails once. */
export async function cancelBooking(token: string, options?: { defer?: Defer }): Promise<{ ok: boolean }> {
  const booking = await resolveToken(token)
  if (!booking) return { ok: false }

  const now = new Date()
  const claim = await prisma.callBooking.updateMany({
    where: { id: booking.id, status: 'BOOKED', startsAt: { gt: now } },
    data: { status: 'CANCELLED', cancelledAt: now },
  })
  if (claim.count === 0) return { ok: false }

  await dispatch(async () => {
    await Promise.all([
      sendVisitorCancellation(booking, 'visitor'),
      sendOwnerNotice(booking, { kind: 'cancelled' }, OWNER_TIMEZONE),
      removeFromCalendar(booking),
      cancelReminders(booking.id),
    ])
  }, options?.defer)

  return { ok: true }
}

/**
 * Moves the booking the token leads to. Under the lock: claims the old row
 * (BOOKED and ahead, to CANCELLED), checks the new time is on offer with the
 * old row out of the way, then creates the new row pointing back at it. A
 * taken slot rolls the claim back. A token over the per-email daily cap is
 * refused as 'invalid', and the visitor is asked to reply by email instead.
 */
export async function rescheduleBooking(
  token: string,
  startsAt: string,
  options?: { defer?: Defer },
): Promise<{ ok: true; bookingId: string } | { ok: false; error: 'slot_taken' | 'invalid' }> {
  const start = new Date(startsAt)
  if (Number.isNaN(start.getTime())) return { ok: false, error: 'invalid' }

  const current = await resolveToken(token)
  const now = new Date()
  if (!current || current.status !== 'BOOKED' || current.startsAt <= now) return { ok: false, error: 'invalid' }

  const dayAgo = new Date(now.getTime() - 24 * 60 * 60_000)
  await warmCalendarBusy(now)

  let moved: CallBooking | null
  try {
    moved = await prisma.$transaction(async tx => {
      await lock(tx)

      if ((await tx.callBooking.count({ where: { email: current.email, createdAt: { gte: dayAgo } } })) >= MAX_BOOKINGS_PER_EMAIL_PER_DAY) {
        return null
      }

      const claim = await tx.callBooking.updateMany({
        where: { id: current.id, status: 'BOOKED', startsAt: { gt: now } },
        data: { status: 'CANCELLED', cancelledAt: now },
      })
      if (claim.count === 0) return null

      if (!offered(await openSlots(tx, now, current.id), start)) throw new SlotTakenError()

      return tx.callBooking.create({
        data: {
          startsAt: start,
          endsAt: new Date(start.getTime() + CALL_MINUTES * 60_000),
          name: current.name,
          email: current.email,
          business: current.business,
          need: current.need,
          timezone: current.timezone,
          meetingUrl: meetingUrlFromEnv() ?? current.meetingUrl,
          source: current.source,
          attribution: readAttribution(current.attribution) ?? undefined,
          ipHash: current.ipHash,
          phone: current.phone,
          smsConsentAt: current.smsConsentAt,
          rescheduledFromId: current.id,
        },
      })
    }, TX_OPTIONS)
  } catch (error) {
    if (error instanceof SlotTakenError) return { ok: false, error: 'slot_taken' }
    throw error
  }

  if (!moved) return { ok: false, error: 'invalid' }
  const next = moved

  await dispatch(async () => {
    await Promise.all([
      sendVisitorConfirmation(next, manageUrlFor(next.id), true),
      sendOwnerNotice(next, { kind: 'moved', from: current.startsAt }, OWNER_TIMEZONE),
      removeFromCalendar(current),
      addToCalendar(next),
      cancelReminders(current.id),
      scheduleReminders(next, manageUrlFor(next.id)),
    ])
  }, options?.defer)

  return { ok: true, bookingId: next.id }
}

/**
 * Upcoming: booked calls that have not ended, soonest first. Past: everything
 * else, latest first, capped at 200. A row a reschedule replaced is left out,
 * since its replacement is the booking.
 */
export async function listBookings(): Promise<{ upcoming: DashboardBooking[]; past: DashboardBooking[] }> {
  const now = new Date()
  const [upcoming, past] = await Promise.all([
    prisma.callBooking.findMany({ where: { status: 'BOOKED', endsAt: { gt: now } }, orderBy: { startsAt: 'asc' } }),
    prisma.callBooking.findMany({
      where: { OR: [{ status: { not: 'BOOKED' } }, { endsAt: { lte: now } }] },
      orderBy: { startsAt: 'desc' },
      take: 200,
    }),
  ])

  const replaced = new Set(
    (
      await prisma.callBooking.findMany({
        where: { rescheduledFromId: { in: past.map(b => b.id) } },
        select: { rescheduledFromId: true },
      })
    ).map(row => row.rescheduledFromId),
  )

  return {
    upcoming: upcoming.map(toDashboard),
    past: past.filter(b => !replaced.has(b.id)).map(toDashboard),
  }
}

/**
 * Alex marking a call. CANCELLED only from BOOKED: takes the event off the
 * calendar, and emails the visitor when the call was still ahead. COMPLETED and NO_SHOW can be set from BOOKED or
 * swapped for each other, to fix a mis-click; a cancelled call stays cancelled.
 */
export async function setBookingStatus(
  id: string,
  status: 'COMPLETED' | 'NO_SHOW' | 'CANCELLED',
  options?: { defer?: Defer },
): Promise<void> {
  if (status !== 'CANCELLED') {
    await prisma.callBooking.updateMany({ where: { id, status: { in: ['BOOKED', 'COMPLETED', 'NO_SHOW'] } }, data: { status } })
    return
  }

  const now = new Date()
  const claim = await prisma.callBooking.updateMany({ where: { id, status: 'BOOKED' }, data: { status: 'CANCELLED', cancelledAt: now } })
  if (claim.count === 0) return

  const booking = await prisma.callBooking.findUnique({ where: { id } })
  if (!booking) return
  const stillAhead = booking.startsAt > now
  await dispatch(async () => {
    await Promise.all([removeFromCalendar(booking), cancelReminders(booking.id), ...(stillAhead ? [sendVisitorCancellation(booking, 'owner')] : [])])
  }, options?.defer)
}

export async function getWeeklyHours(): Promise<WeeklyHours> {
  const rules = await prisma.availabilityRule.findMany({ orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }] })
  return rules.map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime }))
}

/** Replaces the whole week, in Alex's zone. Callers validate with weeklyHoursSchema first. */
export async function saveWeeklyHours(hours: WeeklyHours): Promise<void> {
  await prisma.$transaction(async tx => {
    await lock(tx)
    await tx.availabilityRule.deleteMany()
    if (hours.length > 0) {
      await tx.availabilityRule.createMany({
        data: hours.map(({ dayOfWeek, startTime, endTime }) => ({ dayOfWeek, startTime, endTime, timezone: OWNER_TIMEZONE })),
      })
    }
  }, TX_OPTIONS)
}

/** Time off that has not ended yet, soonest first. */
export async function listTimeOff(): Promise<TimeOffBlock[]> {
  const rows = await prisma.timeOff.findMany({ where: { endsAt: { gt: new Date() } }, orderBy: { startsAt: 'asc' } })
  return rows.map(row => ({ id: row.id, startsAt: row.startsAt.toISOString(), endsAt: row.endsAt.toISOString(), note: row.note }))
}

/** A full ISO instant as is; a datetime-local value ("YYYY-MM-DDTHH:mm") as Alex's wall clock. */
function timeOffInstant(value: string): Date {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? zonedTimeToUtc(value.slice(0, 10), value.slice(11), OWNER_TIMEZONE) : new Date(value)
}

/** Existing calls inside the new time off are kept; cancelling them is a separate step from the dashboard. */
export async function addTimeOff(input: TimeOffInput): Promise<void> {
  const startsAt = timeOffInstant(input.startsAt)
  const endsAt = timeOffInstant(input.endsAt)
  if (endsAt <= startsAt) throw new BookingInputError('Time off must end after it starts.')
  if (endsAt <= new Date()) throw new BookingInputError('That time off has already ended.')

  await prisma.$transaction(async tx => {
    await lock(tx)
    await tx.timeOff.create({ data: { startsAt, endsAt, note: input.note ?? null } })
  }, TX_OPTIONS)
}

export async function removeTimeOff(id: string): Promise<void> {
  await prisma.timeOff.deleteMany({ where: { id } })
}
