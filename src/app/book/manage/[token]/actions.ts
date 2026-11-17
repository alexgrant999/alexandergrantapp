'use server'

import { revalidatePath } from 'next/cache'
import { after } from 'next/server'
import { cancelBooking, rescheduleBooking } from '@/lib/services/booking'
import { manageTokenSchema, rescheduleSchema } from '@/lib/validators/booking'

type ManageResult = { ok: boolean; error?: string }

const GONE = 'This call can no longer be changed online. Reply to your confirmation email and Alex will sort it out.'

/** The booking id always comes from the verified token, never from the client. */
export async function cancelBookingAction(token: string): Promise<ManageResult> {
  const parsed = manageTokenSchema.safeParse(token)
  if (!parsed.success) return { ok: false, error: GONE }

  try {
    const { ok } = await cancelBooking(parsed.data, { defer: after })
    if (!ok) return { ok: false, error: 'This call is already cancelled or has already happened.' }
  } catch (err) {
    console.error('[book/manage] cancel failed', err)
    return { ok: false, error: 'Something went wrong. Please try again, or reply to your confirmation email.' }
  }

  revalidatePath(`/book/manage/${parsed.data}`)
  revalidatePath('/dashboard/bookings')
  return { ok: true }
}

export async function rescheduleBookingAction(token: string, startsAt: string): Promise<ManageResult> {
  const parsed = rescheduleSchema.safeParse({ token, startsAt })
  if (!parsed.success) return { ok: false, error: 'Please pick a time.' }

  try {
    const result = await rescheduleBooking(parsed.data.token, parsed.data.startsAt, { defer: after })
    if (!result.ok) {
      return { ok: false, error: result.error === 'slot_taken' ? 'Someone just took that time. Please pick another one.' : GONE }
    }
  } catch (err) {
    console.error('[book/manage] reschedule failed', err)
    return { ok: false, error: 'Something went wrong. Please try again, or reply to your confirmation email.' }
  }

  revalidatePath(`/book/manage/${parsed.data.token}`)
  revalidatePath('/dashboard/bookings')
  return { ok: true }
}
