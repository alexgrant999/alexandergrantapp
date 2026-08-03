/**
 * The registered auto-replies for the A2P 10DLC campaign.
 *
 * These strings are declared to carriers as opt_in_message, help_message and
 * opt_out_message. What the number actually replies has to match what the
 * campaign claims it replies, so treat these as registered copy: changing one
 * means updating the campaign, the same as the message samples.
 *
 * See docs/twilio-a2p-campaign.txt.
 */

export const OPT_IN_MESSAGE =
  "Alexander Grant: You're subscribed and will receive links to examples of our work. " +
  'Msg frequency varies, typically one msg per request. Reply HELP for help, STOP to unsubscribe. ' +
  'Msg&Data rates may apply.'

export const HELP_MESSAGE =
  'Alexander Grant: For help, email alexandergrantapp@gmail.com. ' +
  'Reply STOP to unsubscribe. Msg&Data rates may apply.'

export const OPT_OUT_MESSAGE =
  'Alexander Grant: You have successfully been unsubscribed. You will not receive any more ' +
  'messages from this number. Reply START to resubscribe.'

/**
 * Recorded as the consent wording when someone opts in by keyword rather than
 * through the web form, where the checkbox copy is the record instead.
 */
export const KEYWORD_CONSENT_TEXT =
  'Texted START to +17712533190 to request links to examples of previous work. ' +
  'Confirmation sent stating message frequency varies, message and data rates may apply, ' +
  'reply HELP for help and STOP to unsubscribe.'

export const OPT_IN_KEYWORDS = ['START'] as const
export const HELP_KEYWORDS = ['HELP', 'INFO'] as const
export const OPT_OUT_KEYWORDS = [
  'OPTOUT',
  'CANCEL',
  'END',
  'QUIT',
  'UNSUBSCRIBE',
  'REVOKE',
  'STOP',
  'STOPALL',
] as const

export type InboundIntent = 'opt-in' | 'help' | 'opt-out' | 'unknown'

/** Carriers match keywords case-insensitively and ignore surrounding whitespace. */
export function classifyInbound(body: string): InboundIntent {
  const word = body.trim().toUpperCase()
  if ((OPT_IN_KEYWORDS as readonly string[]).includes(word)) return 'opt-in'
  if ((HELP_KEYWORDS as readonly string[]).includes(word)) return 'help'
  if ((OPT_OUT_KEYWORDS as readonly string[]).includes(word)) return 'opt-out'
  return 'unknown'
}
