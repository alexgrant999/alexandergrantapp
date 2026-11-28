'use server'

import { revalidatePath } from 'next/cache'
import { cookies, headers } from 'next/headers'
import { after } from 'next/server'
import { botCheck } from '@/lib/services/booking'
import { respondToPoll } from '@/lib/services/group-poll'
import { POLL_COOKIE_PREFIX, respondSchema } from '@/lib/validators/group-poll'

export type RespondState = { status: 'idle' | 'saved' | 'error'; message?: string; at?: number }

const ERRORS = {
  not_found: 'This poll no longer exists.',
  closed: 'This poll has closed, so answers can no longer change.',
  rate_limited: 'A lot of answers have come from this connection. Please try again in an hour.',
  full: 'This poll has as many answers as it can take.',
} as const

export async function respondAction(_prev: RespondState, formData: FormData): Promise<RespondState> {
  const answers = (value: 'yes' | 'maybe') =>
    [...formData.entries()].filter(([key, v]) => key.startsWith('opt-') && v === value).map(([key]) => key.slice(4))
  const parsed = respondSchema.safeParse({
    slug: formData.get('slug'),
    name: formData.get('name'),
    email: formData.get('email') ?? '',
    phone: formData.get('phone') ?? '',
    interests: formData.getAll('interests').map(String),
    experience: formData.get('experience') || undefined,
    note: formData.get('note') ?? '',
    timezone: formData.get('timezone') || undefined,
    // One radio group per time, named opt-<option id>, valued yes, maybe or no.
    yes: answers('yes'),
    maybe: answers('maybe'),
    website: formData.get('website') ?? '',
    startedAt: formData.get('startedAt'),
  })
  if (!parsed.success) return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Please check the form.', at: Date.now() }

  const check = botCheck(parsed.data, Date.now())
  if (check === 'bot') return { status: 'saved', message: 'Thanks, your answers are in.', at: Date.now() }
  if (check === 'too_fast') return { status: 'error', message: 'That was quick. Please press Save again.', at: Date.now() }
  if (check === 'stale') return { status: 'error', message: 'This page has been open a while. Please refresh it and try again.', at: Date.now() }

  const h = await headers()
  const ip = h.get('x-vercel-forwarded-for')?.trim() || h.get('x-real-ip')?.trim() || h.get('x-forwarded-for')?.split(',').at(-1)?.trim() || null
  const jar = await cookies()
  const cookieName = `${POLL_COOKIE_PREFIX}${parsed.data.slug}`

  let result: Awaited<ReturnType<typeof respondToPoll>>
  try {
    result = await respondToPoll(parsed.data, { ip, editToken: jar.get(cookieName)?.value ?? null, defer: after })
  } catch (err) {
    console.error('[meet] saving answers failed', err)
    return { status: 'error', message: 'Your answers did not save. Please try again.', at: Date.now() }
  }
  if (!result.ok) return { status: 'error', message: ERRORS[result.error], at: Date.now() }

  jar.set(cookieName, result.editToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: `/meet/${parsed.data.slug}`,
    maxAge: 60 * 60 * 24 * 180,
  })
  revalidatePath(`/meet/${parsed.data.slug}`)
  revalidatePath('/dashboard/meetups')
  return {
    status: 'saved',
    message: result.updated ? 'Updated. Everyone sees your new answers.' : 'Thanks, your answers are in. Come back to this page any time to change them.',
    at: Date.now(),
  }
}
