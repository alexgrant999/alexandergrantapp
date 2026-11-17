import { LandingPage, landingMetadata, type LandingContent } from '@/components/landing/LandingPage'
import { PLAYDAY, TRNZK } from '@/components/landing/proofs'

const content: LandingContent = {
  path: '/custom-booking-software-for-studios',
  crumb: 'Booking software for studios',
  title: 'Custom Booking Software for Studios and Classes | Alex Grant',
  description: 'Class and term booking built around how your studio already runs. Live at Playday (8 studios) and TRNZK sewing school. Book a 15 minute call.',
  h1: 'Booking software built around how your studio already runs',
  lead: 'For studios, schools and class businesses whose way of working doesn’t fit a ready-made booking product. I build the system to fit you, so it isn’t another subscription your staff have to learn.',
  before: [
    {
      heading: 'Ready-made, or made to measure?',
      body: [
        'A ready-made booking product is the right answer when your classes are simple and your process already fits its forms. It costs less to start and you can be live this week. If that’s you, I’ll tell you on the call.',
        'Made to measure makes sense when:',
      ],
      bullets: [
        'Your terms, deposits or payment plans don’t fit the product’s booking form.',
        'You’ve added apps and spreadsheets around it to cover what it can’t do.',
        'You want families to manage their own bookings instead of emailing you.',
        'You run more than one location and need them in one place.',
      ],
    },
    {
      heading: 'What a studio system can include',
      body: ['Everything below is running for a client today.'],
      bullets: [
        'Class and term bookings, with class caps.',
        'Deposits, payment plans and card payments.',
        'Invoicing.',
        'Automated follow-up after a booking.',
        'Family accounts, where parents add their own children.',
        'Several studios on one system.',
      ],
    },
  ],
  proofHeading: 'Two studios running on it',
  proofs: [PLAYDAY, TRNZK],
  after: [
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
    { href: '/custom-software-for-small-business', label: 'Custom software for small business' },
  ],
}

export const metadata = landingMetadata(content)

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <LandingPage content={content} searchParams={searchParams} />
}
