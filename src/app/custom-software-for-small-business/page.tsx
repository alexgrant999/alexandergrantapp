import { LandingPage, landingMetadata, type LandingContent } from '@/components/landing/LandingPage'
import { PLAYDAY, BALI_SPIRIT } from '@/components/landing/proofs'

const content: LandingContent = {
  path: '/custom-software-for-small-business',
  crumb: 'Custom software for small business',
  title: 'Custom Software for Small Business, Made to Measure | Alex Grant',
  description: 'Stop running your business across spreadsheets, Google Docs and Mailchimp. One system built around how you already work. Playday and Bali Spirit. Book a 15 minute call.',
  h1: 'One system built around how your business already works',
  lead: 'You already have a way of working. It just lives in a Wix or Squarespace site, Google Docs, Mailchimp and a few spreadsheets. I replace them with one system built around it.',
  before: [
    {
      heading: 'The patchwork problem',
      bullets: [
        'The same customer is typed into three places, and the three don’t always agree.',
        'Nothing talks to anything else, so someone copies between tabs every day.',
        'One person knows how it all fits together, and the business stalls when they’re away.',
        'Each tool does its part well, but none of them was built for the way you work.',
      ],
    },
    {
      heading: 'What made to measure means',
      body: ['Ready-made software asks you to change how you work to fit it. I do it the other way round.'],
      steps: [
        ['I start from how you work now.', 'What your staff and customers already do, step by step.'],
        ['I build to fit that.', 'Bookings, store, invoicing and customer portal in one system, so nobody has to relearn their job.'],
        ['I stay on to change it.', 'When the business changes, the software changes with it.'],
      ],
    },
  ],
  proofHeading: 'Two businesses running on it',
  proofs: [PLAYDAY, BALI_SPIRIT],
  after: [
    {
      heading: 'What it suits, and what it doesn’t',
      body: [
        'If one ready-made tool already does the job, keep it. Custom software isn’t worth it for a problem a subscription has solved, and I’ll tell you that on the call.',
        'It suits a business that has outgrown its tools: the work happens in the gaps between them, and the gaps are costing you time or sales.',
      ],
    },
    {
      heading: 'How it works',
      steps: [
        ['A 15 minute call.', 'You tell me how things work today and where it hurts. If a ready-made tool would do the job, I’ll say so.'],
        ['I look at how you work now.', 'The forms, the spreadsheets, the emails, and who does what.'],
        ['I build it and you move over in stages.', 'One part of the business first, then the rest once it’s working. I stay on to change it as you change.'],
      ],
    },
  ],
  related: [
    { href: '/wix-booking-alternative', label: 'Outgrown Wix Bookings?' },
    { href: '/custom-booking-software-for-studios', label: 'Custom booking software for studios' },
  ],
}

export const metadata = landingMetadata(content)

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <LandingPage content={content} searchParams={searchParams} />
}
