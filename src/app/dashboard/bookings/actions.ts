'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { hasSession } from '@/lib/auth/session'
import {
  addTimeOff,
  BookingInputError,
  removeTimeOff,
  saveWeeklyHours,
  setBookingStatus,
  type WeeklyHours,
} from '@/lib/services/booking'
import { bookingIdSchema, bookingStatusSchema, timeOffSchema, weeklyHoursSchema } from '@/lib/validators/booking'

type ActionResult = { ok: boolean; error?: string }

// Server actions are reachable by a direct POST from any path, so the
// middleware matcher on /dashboard does not cover them. Each one checks the
// signed session cookie itself.
const SIGNED_OUT: ActionResult = { ok: false, error: 'Your session has expired. Please sign in again.' }
const FAILED: ActionResult = { ok: false, error: 'Something went wrong. Please try again.' }

function done(): ActionResult {
  revalidatePath('/dashboard/bookings')
  revalidatePath('/book')
  return { ok: true }
}

export async function saveWeeklyHoursAction(hours: WeeklyHours): Promise<ActionResult> {
  if (!(await hasSession())) return SIGNED_OUT
  const parsed = weeklyHoursSchema.safeParse(hours)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the hours and try again.' }

  try {
    await saveWeeklyHours(parsed.data)
  } catch (err) {
    console.error('[bookings] save hours failed', err)
    return FAILED
  }
  return done()
}

export async function addTimeOffAction(input: { startsAt: string; endsAt: string; note?: string }): Promise<ActionResult> {
  if (!(await hasSession())) return SIGNED_OUT
  const parsed = timeOffSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the dates and try again.' }

  try {
    await addTimeOff(parsed.data)
  } catch (err) {
    if (err instanceof BookingInputError) return { ok: false, error: err.message }
    console.error('[bookings] add time off failed', err)
    return FAILED
  }
  return done()
}

export async function removeTimeOffAction(id: string): Promise<ActionResult> {
  if (!(await hasSession())) return SIGNED_OUT
  const parsed = bookingIdSchema.safeParse(id)
  if (!parsed.success) return { ok: false, error: 'That time off could not be found.' }

  try {
    await removeTimeOff(parsed.data)
  } catch (err) {
    console.error('[bookings] remove time off failed', err)
    return FAILED
  }
  return done()
}

export async function setBookingStatusAction(id: string, status: 'COMPLETED' | 'NO_SHOW' | 'CANCELLED'): Promise<ActionResult> {
  if (!(await hasSession())) return SIGNED_OUT
  const parsedId = bookingIdSchema.safeParse(id)
  const parsedStatus = bookingStatusSchema.safeParse(status)
  if (!parsedId.success || !parsedStatus.success) return { ok: false, error: 'That booking could not be updated.' }

  try {
    await setBookingStatus(parsedId.data, parsedStatus.data, { defer: after })
  } catch (err) {
    console.error('[bookings] set status failed', err)
    return FAILED
  }
  return done()
}
