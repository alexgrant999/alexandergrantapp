import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { sendPortfolio } from '@/lib/services/voice-calls'
import { portfolioToolSchema } from '@/lib/validators/voice'
import { safeEqual } from '@/lib/voice/signature'

/**
 * Mid-call tool. The agent hits this while the caller is on the line, so the
 * response text is spoken back — keep it short and say what happened.
 */
export async function POST(req: Request) {
  const presented = (await headers()).get('x-voice-tool-secret')
  if (!safeEqual(presented, process.env.VOICE_TOOL_SECRET)) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const parsed = portfolioToolSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    // Spoken back to the caller, so this doubles as a retry instruction.
    return NextResponse.json(
      { sent: false, message: "That number didn't look right. Ask the caller to repeat it with their country code." },
      { status: 200 }
    )
  }

  try {
    await sendPortfolio(parsed.data)
    return NextResponse.json({ sent: true, message: 'Examples texted to the caller.' })
  } catch (error) {
    console.error('[voice] portfolio send failed', error)
    return NextResponse.json(
      { sent: false, message: "The text didn't go through. Tell the caller Alex will email the examples instead." },
      { status: 200 }
    )
  }
}
