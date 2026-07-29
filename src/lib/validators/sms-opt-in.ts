import { z } from 'zod'

/**
 * The exact wording next to the consent checkbox. Stored with every opt-in so
 * there is a record of what was agreed to, not just that something was.
 * If you change this, the change applies only to opt-ins from that point on.
 */
export const CONSENT_TEXT =
  'By checking this box, you agree to receive text messages from Alexander Grant at the mobile number provided. ' +
  'These messages contain links to examples of previous work. Message frequency varies, typically one message per request. ' +
  'Message and data rates may apply. Reply STOP to unsubscribe or HELP for help.'

/**
 * Accepts what people actually type and normalises to E.164.
 * A bare 10-digit number is assumed US, since that is where the sending number
 * is registered. Anything else must carry its own country code.
 */
export function normalisePhone(input: string): string | null {
  const trimmed = input.trim()
  const hasPlus = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')

  if (!digits) return null
  if (hasPlus) return digits.length >= 7 && digits.length <= 15 ? `+${digits}` : null

  // A US area code never starts with 0 or 1, so a bare 10-digit number
  // beginning with either is a local format from somewhere else (an Australian
  // 04xx mobile, say). Guessing +1 would produce a real but wrong number, so
  // reject and make the caller supply a country code.
  if (digits.length === 10 && /^[2-9]/.test(digits)) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  return null
}

export const smsOptInSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, 'Please enter your mobile number')
    .transform(normalisePhone)
    .refine((v): v is string => v !== null, 'Enter a valid mobile number, including the country code if you are outside the US'),
  name: z.string().trim().max(80).optional().or(z.literal('').transform(() => undefined)),
  // Must be actively ticked. An unchecked box submits nothing at all.
  consent: z.literal('yes', { message: 'Please tick the box to agree to receive text messages' }),
})

export type SmsOptInInput = z.infer<typeof smsOptInSchema>
