import { headers } from 'next/headers'
import { recordCall } from '@/lib/services/voice-calls'
import { postCallWebhookSchema } from '@/lib/validators/voice'
import { verifyElevenLabsSignature } from '@/lib/voice/signature'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get('elevenlabs-signature')

  const verified = verifyElevenLabsSignature(body, signature, process.env.ELEVENLABS_WEBHOOK_SECRET)
  if (!verified.ok) {
    console.error('[voice] webhook rejected:', verified.reason)
    return new Response('Webhook signature verification failed', { status: 401 })
  }

  // The endpoint may also receive audio, call-failure and account-level events.
  // ElevenLabs disables an endpoint after 10 consecutive non-200s, so anything
  // we don't handle is acknowledged rather than rejected.
  const raw = JSON.parse(body)
  if (raw?.type !== 'post_call_transcription') {
    return new Response('ok')
  }

  const parsed = postCallWebhookSchema.safeParse(raw)
  if (!parsed.success) {
    // Logged in full so a shape change is recoverable from the Vercel logs
    // rather than silently killing the endpoint.
    console.error('[voice] post-call payload did not match schema', JSON.stringify(raw))
    return new Response('ok')
  }

  try {
    await recordCall(parsed.data)
  } catch (error) {
    // 500 so ElevenLabs retries rather than dropping the call record.
    console.error('[voice] failed to record call', error)
    return new Response('Failed to record call', { status: 500 })
  }

  return new Response('ok')
}
