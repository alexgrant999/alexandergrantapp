import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { password } = await req.json()

  if (password !== process.env.DASHBOARD_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('dashboard_session', process.env.DASHBOARD_PASSWORD!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })

  return NextResponse.json({ ok: true })
}
