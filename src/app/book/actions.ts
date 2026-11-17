'use server'

import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { bookCall, botCheck } from '@/lib/services/booking'
import { ATTRIBUTION_KEYS, bookCallSchema } from '@/lib/validators/booking'

/**
 * `code: 'paused'`: online booking is off for today (the overall daily cap), not anything the visitor did.
 * `code: 'retry'`: sent too soon after the form rendered; nothing was saved, keep the typed values and press Book again.
 */
export type BookFormState = { error?: string; fieldErrors?: Record<string, string>; code?: 'paused' | 'retry' }

const FALLBACK = 'Something went wrong on our side. Please try again, or email alexandergrantapp@gmail.com.'

const ERRORS = {
  slot_taken: 'Someone just took that time. Please pick another one.',
  rate_limited:
    'We could not take another booking from you right now. If you already have a call booked, use the link in your confirmation email to change it.',
  paused: 'Online booking is paused for today. Please message Alex instead.',
  invalid: 'That time could not be booked. Please pick another one.',
} as const

/**
 * A visitor booking an intro call from /book. Honeypot first (a bot is sent to
 * the thanks page with nothing saved, never told it was caught), then the
 * schema, then the timing check, which only ever asks for a second press. bookCall re-checks the slot under the lock;
 * the emails go out after the response.
 */
export async function bookCallAction(_prev: BookFormState, formData: FormData): Promise<BookFormState> {
  const field = (name: string) => {
    const value = formData.get(name)
    return typeof value === 'string' ? value : ''
  }

  if (field('website') !== '') redirect('/book/thanks')

  const parsed = bookCallSchema.safeParse({
    name: field('name'),
    email: field('email'),
    business: field('business'),
    need: field('need'),
    startsAt: field('startsAt'),
    timezone: field('timezone'),
    source: field('source'),
    website: '',
    startedAt: field('startedAt'),
    phone: field('phone'),
    smsConsent: field('smsConsent') === 'on',
    ...Object.fromEntries(ATTRIBUTION_KEYS.map(key => [key, field(key)])),
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '')
      if (key && !fieldErrors[key]) fieldErrors[key] = issue.message
    }
    if (fieldErrors.startedAt) return { error: 'Please refresh the page and try again.' }
    return { error: fieldErrors.startsAt ? 'Please pick a time.' : 'Please check the form.', fieldErrors }
  }

  const check = botCheck(parsed.data, Date.now())
  if (check === 'bot') redirect('/book/thanks')
  if (check === 'too_fast') return { error: 'That was quick. Please press Book again.', code: 'retry' }
  if (check === 'stale') return { error: 'This page has been open a while. Please refresh it and pick a time again.' }

  const h = await headers()
  // x-vercel-forwarded-for is set by Vercel and cannot be spoofed by the client. In x-forwarded-for the
  // client can prepend anything, so only the last entry (added by the nearest proxy) is trusted.
  const ip =
    h.get('x-vercel-forwarded-for')?.trim() ||
    h.get('x-real-ip')?.trim() ||
    h.get('x-forwarded-for')?.split(',').at(-1)?.trim() ||
    null

  let result: Awaited<ReturnType<typeof bookCall>>
  try {
    result = await bookCall(parsed.data, { ip, defer: after })
  } catch (err) {
    console.error('[book] booking failed', err)
    return { error: FALLBACK }
  }

  if (!result.ok) {
    if (result.error === 'slot_taken') return { error: ERRORS.slot_taken, fieldErrors: { startsAt: ERRORS.slot_taken } }
    if (result.error === 'paused') return { error: ERRORS.paused, code: 'paused' }
    return { error: ERRORS[result.error] }
  }

  revalidatePath('/dashboard/bookings')
  redirect(`/book/thanks?b=${encodeURIComponent(result.bookingId)}`)
}
