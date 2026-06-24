import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Alexander Grant',
}

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 text-sm text-gray-700 leading-relaxed">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-gray-500 mb-8">Last updated: June 2026</p>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">Use of This Site</h2>
        <p>
          alexandergrant.app is a personal website operated by Alexander Grant. The RSVP form at
          alexandergrant.app/birthday is provided solely for guests to indicate their attendance
          at a private event. By submitting the form, you confirm that the information you provide
          is accurate.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">SMS Program Terms</h2>
        <p>
          This website operates an internal SMS notification system that sends alerts to the event
          organiser when an RSVP is submitted. Guests who submit the RSVP form will not receive
          any SMS messages as a result of their submission.
        </p>
        <p className="mt-3">
          The organiser&apos;s number is enrolled in this program voluntarily. To opt out, reply
          STOP to any message. Reply HELP for assistance. Message and data rates may apply.
          Message frequency varies based on the number of RSVPs received.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">Limitation of Liability</h2>
        <p>
          This site is provided as-is for personal event management purposes. Alexander Grant
          accepts no liability for any issues arising from use of this site.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">Contact</h2>
        <p>
          Questions?{' '}
          <a href="mailto:alex@alexandergrant.app" className="underline">
            alex@alexandergrant.app
          </a>
        </p>
      </section>
    </main>
  )
}
