import { prisma } from '@/lib/db/prisma'
import { Resend } from 'resend'
import type { RsvpInput } from '@/lib/validators/rsvp'

const EVENT = 'Alex’s birthday · Sat July 11, 6:30 PM · East Hampton'

export async function createRsvp(input: RsvpInput) {
  const rsvp = await prisma.rsvp.create({ data: input })

  // Notifications are best-effort: a guest's RSVP is saved regardless of
  // whether email/SMS delivery succeeds or is configured.
  await Promise.allSettled([notifyByEmail(rsvp), notifyBySms(rsvp)])

  return rsvp
}

export function listRsvps() {
  return prisma.rsvp.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function rsvpCounts() {
  const [yes, no, plusOnes] = await Promise.all([
    prisma.rsvp.count({ where: { attending: true } }),
    prisma.rsvp.count({ where: { attending: false } }),
    prisma.rsvp.count({ where: { attending: true, plusOne: true } }),
  ])
  // heads = accepting guests + their +1s
  return { yes, no, plusOnes, heads: yes + plusOnes, total: yes + no }
}

type RsvpRecord = { name: string; attending: boolean; plusOne: boolean }

async function notifyByEmail(rsvp: RsvpRecord) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.RSVP_NOTIFY_EMAIL ?? 'alex@findyoga.com.au'
  if (!apiKey) return

  const resend = new Resend(apiKey)
  const plus = rsvp.attending && rsvp.plusOne ? ' (+1)' : ''
  const verb = rsvp.attending ? `is coming${plus} 🎉` : 'can’t make it'
  const accent = rsvp.attending ? '#1f9d63' : '#b04a4a'

  await resend.emails.send({
    from: 'Alex Birthday <alex@alexandergrant.app>',
    to,
    subject: `RSVP: ${rsvp.name} ${rsvp.attending ? `is coming${plus}` : 'can’t make it'}`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <p style="font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: #999; margin: 0 0 16px;">New RSVP</p>
        <p style="font-size: 22px; color: #1a1a2e; margin: 0 0 4px;"><strong>${escapeHtml(rsvp.name)}</strong> <span style="color:${accent};">${verb}</span></p>
        <p style="font-size: 13px; color: #888; margin: 16px 0 0;">${EVENT}</p>
      </div>
    `,
  })
}

async function notifyBySms(rsvp: RsvpRecord) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER
  const to = process.env.RSVP_NOTIFY_PHONE ?? '+12122038499'
  if (!sid || !token || !from) return

  const plus = rsvp.attending && rsvp.plusOne ? ' (+1)' : ''
  const body = `RSVP: ${rsvp.name} ${rsvp.attending ? `is coming${plus} 🎉` : 'can’t make it'} — birthday Jul 11`

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  })

  if (!res.ok) {
    console.error('[rsvp] Twilio SMS failed', res.status, await res.text())
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
