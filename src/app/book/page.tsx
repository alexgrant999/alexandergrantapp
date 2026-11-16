import type { Metadata } from 'next'
import { CALL_MINUTES } from '@/lib/services/booking'
import { BookingShell } from '@/components/booking/BookingShell'
import { BookingFlow } from '@/components/booking/BookingFlow'

export const metadata: Metadata = {
  title: 'Book a 15 minute call | Alexander Grant',
  description: 'A short conversation about how your business runs today and whether I can help.',
  robots: { index: false, follow: false },
}

/** The booking flow on its own page. The ad landing pages hold the same BookingFlow with their own basePath. */
export default function BookPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <BookingShell
      folio="Book a call"
      step={`${CALL_MINUTES} minutes with Alex`}
      intro={
        <>
          <h1 className="bk-h1">Book a {CALL_MINUTES} minute call.</h1>
          <p className="bk-lead">A short conversation about how your business runs today and whether I can help. It’s free, and there’s no pitch.</p>
        </>
      }
      aside={
        <section aria-labelledby="bk-cover">
          <h2 id="bk-cover" className="bk-h3">What we’ll cover</h2>
          <ol className="bk-next">
            <li><span><b>How the business runs today.</b> What you sell, who buys it, and the tools you use to keep it going.</span></li>
            <li><span><b>What isn’t working.</b> The sales that should be higher, or the part of the week that goes on copying between tabs.</span></li>
            <li><span><b>Whether I can help.</b> If I can’t, I’ll say so.</span></li>
          </ol>
        </section>
      }
    >
      <BookingFlow searchParams={searchParams} />
    </BookingShell>
  )
}
