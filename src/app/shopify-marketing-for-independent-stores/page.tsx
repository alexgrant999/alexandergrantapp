import { LandingPage, landingMetadata, type LandingContent } from '@/components/landing/LandingPage'
import { ADVENTURELINE } from '@/components/landing/proofs'

const content: LandingContent = {
  path: '/shopify-marketing-for-independent-stores',
  crumb: 'Shopify SEO, ads and email',
  title: 'Shopify SEO Consultant: SEO, Ads and Email | Alex Grant',
  description: 'One person for your Shopify store’s Google and Meta ads, SEO and email. Adventureline: July sales up 69% year on year. Book a 15 minute call.',
  h1: 'A Shopify SEO consultant who also runs your ads and email',
  lead: 'One person runs your Google and Meta ads, your search and your email. Every month you get a plain report on what it did to your sales.',
  before: [
    {
      heading: 'Why one person for all three',
      body: [
        'Ads, search and email reach the same customers. When three different people run them, each one claims the same sale and nobody decides where the next dollar should go.',
        'With one person, there’s one set of priorities and one report, measured against your sales and not against clicks.',
      ],
    },
  ],
  proofHeading: 'An outdoor store on Shopify',
  proofs: [ADVENTURELINE],
  after: [
    {
      heading: 'What I do each month',
      bullets: [
        'Run and adjust your Google and Meta ad campaigns.',
        'Rewrite collection and product pages so they’re found in search.',
        'Write and send your email campaigns.',
        'Send you a plain report on what it all did to your sales, year on year.',
      ],
    },
    {
      heading: 'Is it a fit?',
      body: [
        'I work with independent stores, usually with the owner. If you need a large agency team, I’m not that.',
        'You’ll need a Shopify store that’s already selling, and to give me access to it and to your ad accounts. If I don’t think I can move your sales, I’ll say so on the call.',
      ],
    },
  ],
  related: [
    { href: '/custom-software-for-small-business', label: 'Custom software for small business' },
  ],
}

export const metadata = landingMetadata(content)

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <LandingPage content={content} searchParams={searchParams} />
}
