import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Alexander Grant',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 text-sm text-gray-700 leading-relaxed">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: July 2026</p>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">Who We Are</h2>
        <p>
          alexandergrant.app is operated by Alexander Grant, an independent software development
          consultancy that builds and operates booking and marketing platforms for owner-operated
          businesses.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">SMS Program</h2>
        <p>
          We operate an SMS program that sends prospective clients links to examples of previous
          work. There are two ways to join, and both require you to actively ask for the messages:
        </p>
        <ul className="mt-3 list-disc pl-5 space-y-2">
          <li>
            <strong>Web form.</strong> At{' '}
            <a href="/sms" className="underline">
              alexandergrant.app/sms
            </a>
            , you enter your own mobile number and tick a consent box that is unchecked by default.
          </li>
          <li>
            <strong>By phone.</strong> When you call our published business number, an automated
            assistant asks whether you would like examples texted to you. It proceeds only if you
            agree, then collects and reads back your number to confirm. The call is recorded and
            that recording is our record of your consent.
          </li>
        </ul>
        <p className="mt-3">
          We never message a number we did not receive directly from its owner. We do not purchase,
          rent, scrape or import phone number lists.
        </p>
        <p className="mt-3">
          Message frequency varies, typically one message per request. Message and data rates may
          apply. Reply STOP to any message to unsubscribe, or HELP for help.
        </p>
        <p className="mt-3">
          <strong>
            Mobile numbers and consent are never sold, rented or shared with third parties for
            marketing purposes.
          </strong>{' '}
          Numbers are shared only with our messaging provider (Twilio) for the sole purpose of
          delivering the messages you asked for.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">Data We Collect</h2>
        <p>
          <strong>SMS opt-ins:</strong> your mobile number, optionally your name, the exact consent
          wording you agreed to, and the date and time. We also store a one-way hash of your IP
          address as evidence of where the opt-in originated. The raw IP address is not retained.
        </p>
        <p className="mt-3">
          <strong>Phone enquiries:</strong> calls to our business number are recorded and
          transcribed, which is disclosed at the start of every call. We keep the transcript, a
          summary, and any details you provide about your business so we can follow up.
        </p>
        <p className="mt-3">
          <strong>Client portal:</strong> for existing clients, the contact and billing details
          needed to issue invoices and manage projects.
        </p>
        <p className="mt-3">
          <strong>Event RSVPs:</strong> the RSVP form at alexandergrant.app/birthday collects a name
          and attendance status for a private event, and notifies the organiser at the
          organiser&apos;s own number. Guests who submit that form are not added to the SMS program
          and receive no text messages.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">Retention and Deletion</h2>
        <p>
          Consent records are kept for as long as you remain subscribed and for a reasonable period
          afterwards, so that we can evidence consent if a carrier or regulator asks. To have your
          data deleted, email{' '}
          <a href="mailto:alex@alexandergrant.app" className="underline">
            alex@alexandergrant.app
          </a>
          .
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">Contact</h2>
        <p>
          For privacy enquiries, email{' '}
          <a href="mailto:alex@alexandergrant.app" className="underline">
            alex@alexandergrant.app
          </a>
          .
        </p>
      </section>
    </main>
  )
}
