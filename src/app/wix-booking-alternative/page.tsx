import { LandingPage, landingMetadata, type LandingContent } from '@/components/landing/LandingPage'
import { PLAYDAY } from '@/components/landing/proofs'

const content: LandingContent = {
  path: '/wix-booking-alternative',
  crumb: 'Wix booking alternative',
  title: 'Outgrown Wix Bookings? A Custom Booking Site | Alex Grant',
  description: 'When Wix or Squarespace can no longer handle your bookings, I build a system around how you already work. Built for Playday, 8 studios live. Book a 15 minute call.',
  h1: 'When your Wix site can no longer run your bookings',
  lead: 'I replace it with one booking system built around how you already run your classes, so your staff keep working the way they do and stop copying between tabs.',
  before: [
    {
      heading: 'Signs you’ve outgrown it',
      bullets: [
        'Bookings are in one place and payments in another, and someone matches them by hand.',
        'Staff type the same details into a spreadsheet, an invoice and an email.',
        'Parents email or call to change a date, because they can’t do it themselves.',
        'You pay for add-on apps to cover the gaps, and they don’t share information.',
        'The way you really run a term or a class doesn’t fit the booking form, so you work around it.',
      ],
    },
    {
      heading: 'What I replace it with',
      body: [
        'One system, built from your current process: bookings, payments, invoicing and automated follow-up in the same place.',
        'It’s made to measure. I start from how your staff and customers already do things and build to fit that, so nobody has to relearn their job.',
      ],
    },
  ],
  proofHeading: 'A Wix site that became a booking platform',
  proofs: [PLAYDAY],
  after: [
    {
      heading: 'What about my Google rankings?',
      body: [
        'Moving a site can lose rankings when old page addresses stop working. Before launch I map every old page to its new address, so existing links and search results keep leading somewhere.',
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
    { href: '/custom-booking-software-for-studios', label: 'Custom booking software for studios' },
    { href: '/custom-software-for-small-business', label: 'Custom software for small business' },
  ],
}

export const metadata = landingMetadata(content)

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <LandingPage content={content} searchParams={searchParams} />
}
