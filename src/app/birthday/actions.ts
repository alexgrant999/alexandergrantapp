'use server'

import { rsvpSchema } from '@/lib/validators/rsvp'
import { createRsvp } from '@/lib/services/rsvp'

export type RsvpState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  name?: string
  attending?: boolean
  plusOne?: boolean
}

export async function submitRsvp(_prev: RsvpState, formData: FormData): Promise<RsvpState> {
  const attending = formData.get('attending') === 'yes'
  const parsed = rsvpSchema.safeParse({
    name: formData.get('name'),
    attending,
    // A +1 only counts when the guest is actually coming.
    plusOne: attending && formData.get('plusOne') === 'yes',
  })

  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Something looked off' }
  }

  try {
    await createRsvp(parsed.data)
    return { status: 'success', name: parsed.data.name, attending: parsed.data.attending, plusOne: parsed.data.plusOne }
  } catch (err) {
    console.error('[rsvp] failed to save', err)
    return { status: 'error', message: 'Could not save your RSVP. Please try again, or text 212-203-8499.' }
  }
}
