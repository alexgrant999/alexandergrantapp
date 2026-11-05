import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createHash, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, createSessionToken } from '@/lib/auth/session'

const schema = z.object({ password: z.string() })

export async function POST(req: Request) {
  const expected = process.env.DASHBOARD_PASSWORD
  const parsed = schema.safeParse(await req.json().catch(() => null))

  const valid =
    !!expected &&
    parsed.success &&
    timingSafeEqual(
      createHash('sha256').update(parsed.data.password).digest(),
      createHash('sha256').update(expected).digest(),
    )
  if (!valid) return NextResponse.json({ error: 'Invalid password' }, { status: 401 })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
