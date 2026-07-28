import crypto from 'node:crypto'

/**
 * Verifies the `ElevenLabs-Signature` header on post-call webhooks.
 *
 * The header is Stripe-style: `t=<unix seconds>,v0=<hex hmac>` where the HMAC is
 * SHA-256 over `${t}.${rawBody}` keyed with the webhook secret.
 *
 * Fails closed. A missing secret is a configuration error, not a reason to skip.
 */

const TOLERANCE_SECONDS = 30 * 60

export type SignatureResult = { ok: true } | { ok: false; reason: string }

export function verifyElevenLabsSignature(
  rawBody: string,
  header: string | null,
  secret: string | undefined
): SignatureResult {
  if (!secret) return { ok: false, reason: 'ELEVENLABS_WEBHOOK_SECRET is not set' }
  if (!header) return { ok: false, reason: 'missing ElevenLabs-Signature header' }

  const parts = Object.fromEntries(
    header
      .split(',')
      .map(p => p.trim().split('='))
      .filter(([k, v]) => k && v)
      .map(([k, ...rest]) => [k, rest.join('=')])
  )

  const timestamp = parts.t
  const signature = parts.v0

  if (!timestamp || !signature) {
    // Logged without the secret so a format change is debuggable from the Vercel logs.
    return { ok: false, reason: `unexpected signature format: ${header.slice(0, 40)}` }
  }

  const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp))
  if (!Number.isFinite(age) || age > TOLERANCE_SECONDS) {
    return { ok: false, reason: `timestamp outside tolerance (${age}s)` }
  }

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')

  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, reason: 'signature mismatch' }
  }

  return { ok: true }
}

/** Constant-time compare for the shared secret on the mid-call tool endpoint. */
export function safeEqual(a: string | null | undefined, b: string | null | undefined) {
  if (!a || !b) return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)
}
