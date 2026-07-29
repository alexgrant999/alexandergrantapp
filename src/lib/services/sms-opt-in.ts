import crypto from 'node:crypto'
import { prisma } from '@/lib/db/prisma'
import { CONSENT_TEXT, type SmsOptInInput } from '@/lib/validators/sms-opt-in'
import { portfolioSms } from '@/lib/voice/portfolio'

/**
 * Records consent, then sends the portfolio message.
 *
 * The consent record is written first and independently of delivery: someone who
 * ticked the box has opted in whether or not the carrier accepts the message.
 * That matters while the A2P campaign is pending, since every US-bound send
 * currently fails with error 30034.
 */
export async function recordSmsOptIn(
  input: SmsOptInInput,
  context: { userAgent?: string | null; ip?: string | null }
) {
  const data = {
    name: input.name ?? null,
    source: 'web',
    consentText: CONSENT_TEXT,
    userAgent: context.userAgent?.slice(0, 500) ?? null,
    ipHash: hashIp(context.ip),
    // Re-opting in clears a previous opt-out.
    optedOutAt: null,
  }

  await prisma.smsOptIn.upsert({
    where: { phone: input.phone },
    create: { phone: input.phone, ...data },
    update: data,
  })

  // Best effort. A carrier rejection must not lose the consent record or show
  // the visitor an error, because their opt-in did in fact succeed.
  try {
    await sendSms(input.phone, portfolioSms(input.name))
    return { delivered: true }
  } catch (err) {
    console.error('[sms-opt-in] send failed', err)
    return { delivered: false }
  }
}

export async function optOut(phone: string) {
  await prisma.smsOptIn.updateMany({ where: { phone }, data: { optedOutAt: new Date() } })
}

export function listSmsOptIns(limit = 200) {
  return prisma.smsOptIn.findMany({ orderBy: { createdAt: 'desc' }, take: limit })
}

/** Stored hashed so the consent record proves origin without keeping an address. */
function hashIp(ip?: string | null) {
  if (!ip) return null
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 32)
}

async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER
  if (!sid || !token || !from) throw new Error('Twilio is not configured')

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  })

  if (!res.ok) throw new Error(`Twilio ${res.status}: ${await res.text()}`)
}
