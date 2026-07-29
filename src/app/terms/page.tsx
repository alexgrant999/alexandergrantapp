import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service — Alexander Grant',
}

export default function TermsPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 text-sm text-gray-700 leading-relaxed">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-gray-500 mb-8">Last updated: July 2026</p>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">Use of This Site</h2>
        <p>
          alexandergrant.app is operated by Alexander Grant, an independent software development
          consultancy. The site publishes information about our services, hosts a portal for
          existing clients, and provides forms through which prospective clients can get in touch.
          By submitting any form, you confirm that the information you provide is accurate and that
          any contact details are your own.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">SMS Program Terms</h2>
        <p>
          <strong>Program description.</strong> Alexander Grant sends prospective clients text
          messages containing links to examples of previous work. This is not a recurring marketing
          campaign.
        </p>
        <p className="mt-3">
          <strong>How to join.</strong> Either submit the form at{' '}
          <a href="/sms" className="underline">
            alexandergrant.app/sms
          </a>{' '}
          with your own mobile number and tick the consent box, which is unchecked by default, or
          call our published business number and tell the assistant you would like the examples
          texted to you. Calls are recorded, which is disclosed at the start of every call.
        </p>
        <p className="mt-3">
          <strong>Message frequency.</strong> Varies. Typically one message per request.
        </p>
        <p className="mt-3">
          <strong>Cost.</strong> Message and data rates may apply. Carriers are not liable for
          delayed or undelivered messages.
        </p>
        <p className="mt-3">
          <strong>Opting out.</strong> Reply STOP, END, QUIT, CANCEL, UNSUBSCRIBE, REVOKE, OPTOUT or
          STOPALL to any message to unsubscribe. You will receive one confirmation and no further
          messages. Reply START to resubscribe.
        </p>
        <p className="mt-3">
          <strong>Help.</strong> Reply HELP or INFO to any message, or email{' '}
          <a href="mailto:alexandergrantapp@gmail.com" className="underline">
            alexandergrantapp@gmail.com
          </a>
          .
        </p>
        <p className="mt-3">
          <strong>Carriers supported.</strong> Major US carriers. Availability on any given carrier
          is not guaranteed.
        </p>
        <p className="mt-3">
          Your mobile number is used only to send the messages described above and is never sold,
          rented or shared with third parties for marketing. See the{' '}
          <a href="/privacy" className="underline">
            Privacy Policy
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">Private Event RSVPs</h2>
        <p>
          The RSVP form at alexandergrant.app/birthday is provided solely for invited guests to
          indicate attendance at a private event. Submitting it notifies the organiser at the
          organiser&apos;s own number. Guests who submit that form are not enrolled in the SMS
          program and receive no text messages.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">Limitation of Liability</h2>
        <p>
          This site is provided as-is. Alexander Grant accepts no liability for any issues arising
          from use of this site, to the extent permitted by law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">Contact</h2>
        <p>
          Questions?{' '}
          <a href="mailto:alexandergrantapp@gmail.com" className="underline">
            alexandergrantapp@gmail.com
          </a>
        </p>
      </section>
    </main>
  )
}
