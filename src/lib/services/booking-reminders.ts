import type { CallBooking } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { formatWhen, zoneCity } from '@/lib/time'
import { normalisePhone } from '@/lib/validators/booking'
import { cancelScheduledEmail, scheduleVisitorReminder } from '@/lib/services/booking-email'

/**
 * Reminders for a booked call: an email the day before, and an email plus a text an hour
 * before. Nothing here runs on a timer. Each reminder is queued with Resend or Twilio when
 * the call is booked, and its id is kept on the booking so a cancel or a move can call it back.
 * Every function is best effort and never throws.
 */

const REMINDERS = [
  { kind: 'day', minutesBefore: 24 * 60 },
  { kind: 'hour', minutesBefore: 60 },
] as const

/** Twilio will not queue a message due in under 15 minutes. One rule for both channels keeps them in step. */
const MIN_LEAD_MS = 16 * 60_000

type SmsConfig = { accountSid: string; authToken: string; serviceSid: string }

/** Texts need a messaging service, because Twilio only schedules through one. Unset means no texts and no phone field on the form. */
function smsConfig(): SmsConfig | null {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const serviceSid = process.env.BOOKING_SMS_MESSAGING_SERVICE_SID
  return accountSid && authToken && serviceSid ? { accountSid, authToken, serviceSid } : null
}

export function smsRemindersEnabled(): boolean {
  return smsConfig() !== null
}

async function twilio(cfg: SmsConfig, path: string, body: Record<string, string>): Promise<{ sid?: string; message?: string; ok: boolean }> {
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(body),
    signal: AbortSignal.timeout(8000),
  })
  const json = (await res.json().catch(() => ({}))) as { sid?: string; message?: string }
  return { ...json, ok: res.ok }
}

async function scheduleSms(booking: CallBooking, manageUrl: string, sendAt: Date): Promise<string | null> {
  const cfg = smsConfig()
  if (!cfg || !booking.phone || !booking.smsConsentAt) return null
  const body = [
    `Alex Grant: your 15 minute call is ${formatWhen(booking.startsAt, booking.timezone)} (${zoneCity(booking.timezone)} time), in one hour.`,
    booking.meetingUrl ? `Join: ${booking.meetingUrl}` : '',
    manageUrl ? `Change or cancel: ${manageUrl}` : '',
    'Reply STOP to opt out.',
  ]
    .filter(Boolean)
    .join(' ')
  const result = await twilio(cfg, 'Messages.json', {
    MessagingServiceSid: cfg.serviceSid,
    To: booking.phone,
    Body: body,
    ScheduleType: 'fixed',
    SendAt: sendAt.toISOString(),
  })
  if (!result.ok || !result.sid) {
    console.warn(`[booking-reminders] text for booking ${booking.id} not queued`, result.message)
    return null
  }
  return result.sid
}

/** Twilio answers "not found" for a few seconds after a message is queued, so a cancel straight after booking is tried again. */
async function cancelSms(sid: string): Promise<void> {
  const cfg = smsConfig()
  if (!cfg) return
  for (const waitMs of [0, 2000, 5000]) {
    if (waitMs) await new Promise(resolve => setTimeout(resolve, waitMs))
    const result = await twilio(cfg, `Messages/${sid}.json`, { Status: 'canceled' })
    if (result.ok) return
    console.warn(`[booking-reminders] cancelling text ${sid} failed`, result.message?.replace(/AC[0-9a-f]{32}/g, 'AC...'))
  }
}

/**
 * Texts Alex when a call is booked, moved or cancelled by the visitor. Sent straight away
 * through the same messaging service as the reminders. Skipped when BOOKING_NOTIFY_PHONE is unset.
 */
export async function sendOwnerSms(
  booking: Pick<CallBooking, 'id' | 'startsAt' | 'name' | 'business'>,
  kind: 'booked' | 'moved' | 'cancelled',
  ownerTimezone: string,
): Promise<void> {
  try {
    const cfg = smsConfig()
    const to = normalisePhone(process.env.BOOKING_NOTIFY_PHONE ?? '')
    if (!cfg || !to) return
    const who = `${booking.name} (${booking.business})`.replace(/\s+/g, ' ').slice(0, 90)
    const when = `${formatWhen(booking.startsAt, ownerTimezone)} ${zoneCity(ownerTimezone)} time`
    const body = kind === 'moved' ? `Intro call moved: ${who}, now ${when}.` : `Intro call ${kind}: ${who}, ${when}.`
    const result = await twilio(cfg, 'Messages.json', { MessagingServiceSid: cfg.serviceSid, To: to, Body: body })
    if (!result.ok) console.warn(`[booking-reminders] owner text (${kind}) for booking ${booking.id} not sent`, result.message)
  } catch (err) {
    console.warn(`[booking-reminders] owner text (${kind}) for booking ${booking.id} failed`, err)
  }
}

async function callBack(emailIds: string[], smsSid: string | null): Promise<void> {
  await Promise.all([...emailIds.map(cancelScheduledEmail), ...(smsSid ? [cancelSms(smsSid)] : [])])
}

/**
 * Queues whatever reminders are still far enough ahead and records their ids. If the booking
 * was cancelled while they were being queued, they are called straight back.
 */
export async function scheduleReminders(booking: CallBooking, manageUrl: string): Promise<void> {
  try {
    const now = Date.now()
    const due = REMINDERS.map(r => ({ kind: r.kind, at: new Date(booking.startsAt.getTime() - r.minutesBefore * 60_000) })).filter(r => r.at.getTime() - now > MIN_LEAD_MS)
    const hour = due.find(r => r.kind === 'hour')
    const [emailIds, smsSid] = await Promise.all([
      Promise.all(due.map(r => scheduleVisitorReminder(booking, manageUrl, r.kind, r.at))).then(ids => ids.filter((id): id is string => id !== null)),
      hour ? scheduleSms(booking, manageUrl, hour.at) : Promise.resolve(null),
    ])
    if (emailIds.length === 0 && !smsSid) return
    const saved = await prisma.callBooking.updateMany({ where: { id: booking.id, status: 'BOOKED' }, data: { reminderEmailIds: emailIds, reminderSmsSid: smsSid } })
    if (saved.count === 0) await callBack(emailIds, smsSid)
  } catch (err) {
    console.warn(`[booking-reminders] queueing reminders for booking ${booking.id} failed`, err)
  }
}

/** Calls back every reminder still queued for a booking that was cancelled or moved. */
export async function cancelReminders(bookingId: string): Promise<void> {
  try {
    const row = await prisma.callBooking.findUnique({ where: { id: bookingId }, select: { reminderEmailIds: true, reminderSmsSid: true } })
    if (!row || (row.reminderEmailIds.length === 0 && !row.reminderSmsSid)) return
    await callBack(row.reminderEmailIds, row.reminderSmsSid)
    await prisma.callBooking.update({ where: { id: bookingId }, data: { reminderEmailIds: [], reminderSmsSid: null } })
  } catch (err) {
    console.warn(`[booking-reminders] cancelling reminders for booking ${bookingId} failed`, err)
  }
}
