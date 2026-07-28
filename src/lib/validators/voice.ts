import { z } from 'zod'

/** Body the ElevenLabs agent posts mid-call to /api/voice/portfolio. */
export const portfolioToolSchema = z.object({
  phone: z
    .string()
    .trim()
    .regex(/^\+[1-9]\d{6,14}$/, 'Phone must be E.164, e.g. +61412345678'),
  name: z.string().trim().max(120).optional(),
  interest: z.string().trim().max(500).optional(),
  conversation_id: z.string().trim().max(200).optional(),
})

export type PortfolioToolInput = z.infer<typeof portfolioToolSchema>

const transcriptTurn = z.object({
  role: z.string(),
  message: z.string().nullable().optional(),
  time_in_call_secs: z.number().nullable().optional(),
})

/**
 * ElevenLabs returns each collected field as either a bare value or a
 * `{ value, rationale }` object depending on the extraction path, so accept both.
 */
const collected = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.object({ value: z.unknown().optional() }).passthrough(),
])

export const postCallWebhookSchema = z.object({
  type: z.string(),
  event_timestamp: z.number().optional(),
  data: z.object({
    agent_id: z.string().optional(),
    conversation_id: z.string(),
    status: z.string().optional(),
    transcript: z.array(transcriptTurn).optional(),
    metadata: z
      .object({
        start_time_unix_secs: z.number().optional(),
        call_duration_secs: z.number().optional(),
        termination_reason: z.string().optional(),
        phone_call: z
          .object({
            external_number: z.string().optional(),
            direction: z.string().optional(),
          })
          .passthrough()
          .optional(),
      })
      .passthrough()
      .optional(),
    analysis: z
      .object({
        transcript_summary: z.string().nullable().optional(),
        call_successful: z.string().nullable().optional(),
        data_collection_results: z.record(z.string(), collected).optional(),
      })
      .passthrough()
      .optional(),
  }),
})

export type PostCallWebhook = z.infer<typeof postCallWebhookSchema>

/** Flattens `{ value: x }` or a bare value down to a trimmed string, or null. */
export function collectedString(input: unknown): string | null {
  if (input == null) return null
  const raw =
    typeof input === 'object' && input !== null && 'value' in input
      ? (input as { value: unknown }).value
      : input
  if (raw == null) return null
  const s = String(raw).trim()
  return s.length ? s : null
}
