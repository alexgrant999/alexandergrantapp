import { prisma } from '@/lib/db/prisma'
import { Resend } from 'resend'
import { portfolioSms } from '@/lib/voice/portfolio'
import { collectedString, type PortfolioToolInput, type PostCallWebhook } from '@/lib/validators/voice'

/**
 * ElevenLabs may pass the conversation id through unresolved if the dynamic
 * variable isn't available, so treat a raw `{{...}}` template as absent.
 */
function realConversationId(id?: string | null) {
  if (!id || id.includes('{{')) return null
  return id
}

// ---------------------------------------------------------------- mid-call

/**
 * Fired by the agent while the caller is still on the line. Sends the SMS and
 * stashes what we know so far; the post-call webhook fills in the rest.
 */
export async function sendPortfolio(input: PortfolioToolInput) {
  await sendSms(input.phone, portfolioSms(input.name))

  const conversationId = realConversationId(input.conversation_id)
  const data = {
    callerNumber: input.phone,
    callerName: input.name || null,
    interest: input.interest || null,
    portfolioSent: true,
  }

  if (conversationId) {
    await prisma.voiceCall.upsert({
      where: { conversationId },
      create: { conversationId, ...data },
      update: data,
    })
  } else {
    await prisma.voiceCall.create({ data })
  }
}

// --------------------------------------------------------------- post-call

export async function recordCall(payload: PostCallWebhook) {
  const { data } = payload
  const fields = data.analysis?.data_collection_results ?? {}

  const callerNumber = data.metadata?.phone_call?.external_number ?? null
  const startedAt = data.metadata?.start_time_unix_secs
    ? new Date(data.metadata.start_time_unix_secs * 1000)
    : null

  // The mid-call portfolio tool may already have written a row, either keyed by
  // this conversation id or (if the id didn't resolve) as an orphan matched on
  // phone number. Either way its values win: the caller confirmed them out loud,
  // and blindly overwriting would wipe portfolioSent back to false.
  const existing = await prisma.voiceCall.findUnique({ where: { conversationId: data.conversation_id } })
  const orphan = existing ? null : await findOrphanFromTool(data.conversation_id, callerNumber)
  const prior = existing ?? orphan

  const record = {
    agentId: data.agent_id ?? null,
    callerNumber: callerNumber ?? prior?.callerNumber ?? null,
    callerName: prior?.callerName ?? collectedString(fields.caller_name),
    business: collectedString(fields.business),
    interest: prior?.interest ?? collectedString(fields.interest),
    timeline: collectedString(fields.timeline),
    budget: collectedString(fields.budget),
    summary: data.analysis?.transcript_summary ?? null,
    transcript: (data.transcript ?? []) as object,
    durationSecs: data.metadata?.call_duration_secs ?? null,
    outcome: data.analysis?.call_successful ?? data.status ?? null,
    portfolioSent: prior?.portfolioSent ?? false,
    startedAt,
  }

  const call = await prisma.voiceCall.upsert({
    where: { conversationId: data.conversation_id },
    create: { conversationId: data.conversation_id, ...record },
    update: record,
  })

  if (orphan) await prisma.voiceCall.delete({ where: { id: orphan.id } })

  // Best-effort: the call is logged whether or not the alerts land.
  await Promise.allSettled([notifyByEmail(call), notifyBySms(call)])

  return call
}

/**
 * The tool endpoint writes a row without a conversation id when the dynamic
 * variable doesn't resolve. Match it back by phone number within the hour.
 */
async function findOrphanFromTool(conversationId: string, callerNumber: string | null) {
  if (!callerNumber) return null
  return prisma.voiceCall.findFirst({
    where: {
      conversationId: null,
      callerNumber,
      createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
    },
    orderBy: { createdAt: 'desc' },
  })
}

// ------------------------------------------------------------------ queries

export function listVoiceCalls(limit = 100) {
  return prisma.voiceCall.findMany({ orderBy: { createdAt: 'desc' }, take: limit })
}

export async function voiceCallCounts() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const [total, last30, portfolio] = await Promise.all([
    prisma.voiceCall.count(),
    prisma.voiceCall.count({ where: { createdAt: { gte: since } } }),
    prisma.voiceCall.count({ where: { portfolioSent: true } }),
  ])
  return { total, last30, portfolio }
}

// ------------------------------------------------------------ notifications

type CallRecord = {
  callerName: string | null
  callerNumber: string | null
  business: string | null
  interest: string | null
  timeline: string | null
  budget: string | null
  summary: string | null
  durationSecs: number | null
  portfolioSent: boolean
}

async function notifyByEmail(call: CallRecord) {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.VOICE_NOTIFY_EMAIL ?? 'alex@findyoga.com.au'
  if (!apiKey) return

  const who = call.callerName || call.callerNumber || 'Unknown caller'
  const rows: [string, string | null][] = [
    ['Number', call.callerNumber],
    ['Business', call.business],
    ['Wants', call.interest],
    ['Timeline', call.timeline],
    ['Budget', call.budget],
    ['Length', call.durationSecs ? `${call.durationSecs}s` : null],
    ['Portfolio texted', call.portfolioSent ? 'Yes' : 'No'],
  ]

  await new Resend(apiKey).emails.send({
    from: 'Voice Agent <alex@alexandergrant.app>',
    to,
    subject: `Call: ${who}${call.business ? ` · ${call.business}` : ''}`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
        <p style="font-size: 12px; letter-spacing: .12em; text-transform: uppercase; color: #999; margin: 0 0 16px;">Inbound call</p>
        <p style="font-size: 22px; color: #1a1a2e; margin: 0 0 20px;"><strong>${escapeHtml(who)}</strong></p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          ${rows
            .filter(([, v]) => v)
            .map(
              ([k, v]) => `
            <tr>
              <td style="padding: 6px 12px 6px 0; color: #888; white-space: nowrap; vertical-align: top;">${k}</td>
              <td style="padding: 6px 0; color: #1a1a2e;">${escapeHtml(String(v))}</td>
            </tr>`
            )
            .join('')}
        </table>
        ${
          call.summary
            ? `<p style="font-size: 13px; line-height: 1.6; color: #444; margin: 24px 0 0; padding-top: 20px; border-top: 1px solid #eee;">${escapeHtml(call.summary)}</p>`
            : ''
        }
        <p style="font-size: 12px; color: #aaa; margin: 24px 0 0;">Full transcript in the dashboard under Calls.</p>
      </div>
    `,
  })
}

async function notifyBySms(call: CallRecord) {
  const to = process.env.VOICE_NOTIFY_PHONE ?? process.env.RSVP_NOTIFY_PHONE
  if (!to) return

  const who = call.callerName || call.callerNumber || 'Unknown'
  const what = call.interest ? `, wants ${call.interest.slice(0, 90)}` : ''
  await sendSms(to, `Call: ${who}${call.business ? ` (${call.business})` : ''}${what}`)
}

async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from = process.env.TWILIO_FROM_NUMBER
  if (!sid || !token || !from) {
    throw new Error('Twilio is not configured')
  }

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  })

  if (!res.ok) {
    const detail = await res.text()
    console.error('[voice] Twilio SMS failed', res.status, detail)
    throw new Error(`Twilio SMS failed (${res.status})`)
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}
