import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'dashboard_session'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

const encoder = new TextEncoder()

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)))
  return Array.from(signature, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function createSessionToken(): Promise<string> {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET is not set')
  const expiresAt = String(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)
  return `${expiresAt}.${await sign(expiresAt, secret)}`
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  const secret = process.env.SESSION_SECRET
  if (!token || !secret) return false

  const match = /^(\d+)\.([0-9a-f]{64})$/.exec(token)
  if (!match) return false
  const [, expiresAt, signature] = match
  if (Number(expiresAt) <= Date.now()) return false

  // Both strings are 64 hex chars here, so the loop always runs the full length.
  const expected = await sign(expiresAt, secret)
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i)
  }
  return diff === 0
}

export async function hasSession(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value)
}
