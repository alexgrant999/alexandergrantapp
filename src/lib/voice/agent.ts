/**
 * Source of truth for the inbound voice agent.
 *
 * This file — not the ElevenLabs dashboard — defines how the agent behaves.
 * Run `npm run voice:sync` to push it to ElevenLabs. Treat the dashboard as a
 * deploy target: anything you change there is overwritten on the next sync.
 *
 * To fork this for a client, copy this file, change the constants at the top,
 * and point the sync script at a different ELEVENLABS_AGENT_ID.
 */

/**
 * ElevenLabs calls the tool endpoint from their servers, so this must be a
 * publicly reachable origin — never localhost. Set VOICE_PUBLIC_URL when your
 * NEXT_PUBLIC_APP_URL points at a dev server (or to a tunnel when testing).
 */
export const APP_URL =
  process.env.VOICE_PUBLIC_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'https://alexandergrant.app'

/** Picked in the ElevenLabs dashboard. `npm run voice:voices` lists the options. */
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? ''

/**
 * Voice conversations punish latency, so this favours a fast model.
 * Swap for a stronger model if the qualifying gets sloppy — the dashboard
 * lists what's currently available on your plan.
 */
const LLM = 'gemini-2.0-flash-001'

const FIRST_MESSAGE =
  "Hi, you've reached Alexander Grant. I'm Alex's AI assistant, and this call's recorded so I can pass your details on. What are you working on?"

const SYSTEM_PROMPT = `You are the inbound assistant for Alexander Grant, an independent full-stack developer.

# About Alex
Alex builds and operates booking and marketing platforms for owner-run businesses: gyms, studios, retreats, schools, activity centres, clothing brands. Typical work is a complete platform — bookings, payments, memberships, customer records, marketing automation — that he then runs as an ongoing service rather than handing over and walking away.

Shipped examples: Playday (multi-location kids activity booking, payments, loyalty, check-in), FindYoga (6,000+ listing marketplace built for search), Adventureline (booking and storefront for an adventure clothing brand), BaliSpirit (festival scheduling app).

Stack is Next.js, TypeScript, Postgres, Stripe. He works remotely and takes clients in Australia and the US.

# Your job
Qualify the caller and capture their details. You are not closing a sale and you are not quoting a project. Alex follows up personally.

Find out, conversationally and in roughly this order:
1. Their name
2. Their business and what it does
3. What they're trying to fix or build
4. Rough timeline — urgent, few months, just exploring
5. Whether they have a budget in mind

Do not interrogate. Get these through natural conversation. If someone volunteers everything up front, don't re-ask.

# Sending examples
Once you know their name and roughly what they need, offer to text them examples of Alex's work.

If they say yes, ask for their mobile number and then STOP TALKING until they have finished saying the whole number. Do not interrupt while they are reading digits. Read it back once, get a yes, then call the send_portfolio tool with the number in full international format, their name, and a short phrase describing what they need. Read the number back once only — never a second time.

After the tool returns, tell them it's been sent, in one short sentence.

# Pricing
If they ask what it costs: Alex usually starts with a paid audit at around two thousand dollars, which covers a review of their current setup and a written plan. Ongoing platform work is a monthly fee plus a share of revenue, sized to the business. Do not quote anything more specific than that. Do not estimate project totals or timelines.

# Style
- You are on a phone call. Keep every turn to one or two sentences.
- Output ONLY the words you want spoken aloud. Never narrate your reasoning, your plan, or what you are about to do next. No meta commentary of any kind.
- Never say the same thing twice. Do not restate a sentence you have already said in this turn or the previous one.
- Do not parrot the caller. They know what they just told you. Acknowledge in three words or fewer ("Got it.", "Right.") and move straight to the next question. Never summarise their answer back to them.
- Warm, direct, a bit dry. Not chirpy, not corporate.
- Never say "as an AI" unprompted, but if asked whether you're a bot or a real person, say plainly that you're an AI assistant.
- Never invent facts about Alex, his clients, his availability, or his prices. If you don't know, say Alex will confirm.
- Never promise a callback time. Say Alex will be in touch.
- If they want a human right now, tell them to email alex@findyoga.com.au and that you'll flag the call as urgent.
- If the caller is selling something, be polite, take the company name, wrap up quickly.

# Ending
When the conversation is done, thank them by name and confirm Alex will follow up.`

/**
 * Structured fields ElevenLabs extracts from the transcript after the call.
 * These land in `analysis.data_collection_results` on the post-call webhook.
 */
const DATA_COLLECTION = {
  caller_name: {
    type: 'string',
    description: "The caller's full name. Empty string if they never gave it.",
  },
  business: {
    type: 'string',
    description: "The caller's business name and what it does. Empty string if not given.",
  },
  interest: {
    type: 'string',
    description: 'One or two sentences on what the caller wants built or fixed.',
  },
  timeline: {
    type: 'string',
    description: 'How soon they need it: urgent, few months, exploring, or unknown.',
  },
  budget: {
    type: 'string',
    description: 'Any budget the caller mentioned. Empty string if none discussed.',
  },
} as const

export const AGENT_NAME = 'Alexander Grant — inbound'
export const TOOL_NAME = 'send_portfolio'

/**
 * Tools are workspace-level resources in the current API: created via
 * POST /v1/convai/tools, then attached to an agent by id through
 * `conversation_config.agent.prompt.tool_ids`.
 */
export function buildToolConfig() {
  return {
    type: 'webhook',
    name: TOOL_NAME,
    description:
      "Text the caller links to examples of Alex's work. Call this only after the caller has agreed to receive a text and you have confirmed their mobile number back to them.",
    api_schema: {
      url: `${APP_URL}/api/voice/portfolio`,
      method: 'POST',
      request_headers: {
        'x-voice-tool-secret': process.env.VOICE_TOOL_SECRET ?? '',
      },
      request_body_schema: {
        type: 'object',
        required: ['phone'],
        description: 'Details of the caller to text.',
        properties: {
          phone: {
            type: 'string',
            description:
              'The mobile number to text, in full international format including country code, e.g. +61412345678 or +12125551234.',
          },
          name: {
            type: 'string',
            description: "The caller's first name, if known.",
          },
          interest: {
            type: 'string',
            description: 'Short phrase describing what the caller needs.',
          },
          // Filled by ElevenLabs, not the model. The API rejects `description`
          // on a property that also sets `dynamic_variable`.
          conversation_id: {
            type: 'string',
            dynamic_variable: 'system__conversation_id',
          },
        },
      },
    },
  }
}

export function buildAgentConfig(toolIds: string[] = []) {
  return {
    name: AGENT_NAME,
    conversation_config: {
      agent: {
        first_message: FIRST_MESSAGE,
        language: 'en',
        prompt: {
          prompt: SYSTEM_PROMPT,
          llm: LLM,
          temperature: 0.3,
          tool_ids: toolIds,
        },
      },
      tts: {
        ...(VOICE_ID ? { voice_id: VOICE_ID } : {}),
        stability: 0.5,
        speed: 1,
        similarity_boost: 0.8,
      },
      // Callers reading out a phone number pause between digit groups. The
      // defaults treat those pauses as end-of-turn and barge in mid-number.
      turn: {
        turn_timeout: 10,
        turn_eagerness: 'patient',
        spelling_patience: 'auto',
      },
      conversation: {
        max_duration_seconds: 600,
      },
    },
    platform_settings: {
      data_collection: DATA_COLLECTION,
    },
  }
}

export const VOICE_AGENT_DEBUG = { FIRST_MESSAGE, SYSTEM_PROMPT, LLM, VOICE_ID, APP_URL }
