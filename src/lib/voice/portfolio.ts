/**
 * What the agent texts a caller when they ask to see examples.
 * Edit this list freely — `npm run voice:sync` does not need to be re-run for it,
 * the SMS is built at request time.
 */

export type PortfolioItem = {
  label: string
  url: string
  /** One line the agent can use when describing this out loud. */
  blurb: string
}

export const PORTFOLIO: PortfolioItem[] = [
  {
    label: 'Playday',
    url: 'https://playday.com',
    blurb: 'Multi-location kids activity booking platform — payments, memberships, check-in, loyalty.',
  },
  {
    label: 'FindYoga',
    url: 'https://www.findyoga.com.au',
    blurb: 'Yoga marketplace, 6,000+ listings, built for search.',
  },
  {
    label: 'Adventureline',
    url: 'https://adventureline.com.au',
    blurb: 'Booking and storefront build for an Australian adventure clothing brand.',
  },
]

/**
 * Must stay byte-identical to sample message #1 on the Twilio A2P campaign.
 * Carriers compare real traffic against the registered samples, so changing the
 * wording here means resubmitting the campaign.
 */
export function portfolioSms(name?: string | null) {
  const greeting = name ? `Hi ${name.split(' ')[0]}, ` : ''
  const links = PORTFOLIO.map(p => `${p.label}: ${p.url}`).join('\n')
  return `${greeting}here are a few things I've built:\n\n${links}\n\nAlex will follow up personally.\n\nAlexander Grant\nReply STOP to opt out.`
}
