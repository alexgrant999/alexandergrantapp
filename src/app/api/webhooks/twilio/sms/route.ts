import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { portfolioSms } from '@/lib/voice/portfolio'
import {
  classifyInbound,
  HELP_MESSAGE,
  KEYWORD_CONSENT_TEXT,
  OPT_IN_MESSAGE,
} from '@/lib/sms/auto-replies'

/**
 * Inbound SMS. Exists so the keyword opt-in path the A2P campaign declares is
 * real: texting START has to produce the registered confirmation, not silence.
 *
 * STOP and HELP are also handled natively by Twilio's Advanced Opt-Out before
 * this ever runs, so the replies here are a backstop. What this adds is the
 * consent record and the portfolio message on START.
 */
export async function POST(req: Request) {
  const raw = await req.text()

  if (!isFromTwilio(req, raw)) {
    return new NextResponse('Invalid signature', { status: 403 })
  }

  const params = new URLSearchParams(raw)
  const from = params.get('From')
  const body = params.get('Body') ?? ''
  if (!from) return twiml()

  switch (classifyInbound(body)) {
    case 'opt-in': {
      const data = {
        source: 'sms-keyword',
        consentText: KEYWORD_CONSENT_TEXT,
        optedOutAt: null,
      }
      await prisma.smsOptIn.upsert({
        where: { phone: from },
        create: { phone: from, ...data },
        update: data,
      })
      // The confirmation first, then what they actually asked for.
      await send(from, OPT_IN_MESSAGE)
      await send(from, portfolioSms())
      break
    }

    case 'help':
      await send(from, HELP_MESSAGE)
      break

    case 'opt-out':
      // Twilio has already blocked the number and sent the opt-out reply. Only
      // the record needs updating, and sending anything here would be a message
      // to a number that has just unsubscribed.
      await prisma.smsOptIn.updateMany({ where: { phone: from }, data: { optedOutAt: new Date() } })
      break

    case 'unknown':
      break
  }

  return twiml()
}

/** Empty TwiML, so Twilio does not append a reply of its own. */
function twiml() {
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { 'Content-Type': 'text/xml' },
  })
}

/**
 * Twilio signs the exact URL it was configured with, so a proxy or a trailing
 * slash mismatch breaks verification. TWILIO_SMS_WEBHOOK_URL pins it to the
 * value entered in the console rather than trusting the incoming host header.
 */
function isFromTwilio(req: Request, raw: string) {
  const token = process.env.TWILIO_AUTH_TOKEN
  const signature = req.headers.get('x-twilio-signature')
  if (!token || !signature) return false

  const url = process.env.TWILIO_SMS_WEBHOOK_URL ?? req.url
  const params = new URLSearchParams(raw)
  const payload = [...params.keys()]
    .sort()
    .reduce((acc, key) => acc + key + params.get(key), url)

  const expected = crypto.createHmac('sha1', token).update(Buffer.from(payload, 'utf-8')).digest('base64')

  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

async function send(to: string, body: string) {
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

  // Logged, not thrown: a carrier rejection must not cost us the consent record.
  if (!res.ok) console.error(`[twilio-inbound] send failed ${res.status}: ${await res.text()}`)
}
