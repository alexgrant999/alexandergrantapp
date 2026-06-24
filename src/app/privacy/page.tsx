import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Alexander Grant',
}

export default function PrivacyPage() {
  return (
    <main className="max-w-2xl mx-auto px-6 py-16 text-sm text-gray-700 leading-relaxed">
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-500 mb-8">Last updated: June 2026</p>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">SMS Notifications</h2>
        <p>
          This website collects RSVP responses submitted through the birthday invitation form at
          alexandergrant.app/birthday. When a guest submits the form, an SMS notification is sent
          to the event organiser&apos;s own mobile number. Website visitors who submit the RSVP
          form are <strong>never</strong> sent any text messages.
        </p>
        <p className="mt-3">
          Mobile numbers collected through the RSVP form are used solely to record attendance
          intent and are <strong>not shared with any third parties</strong> for marketing or any
          other purpose.
        </p>
        <p className="mt-3">
          Message frequency: one SMS notification is sent to the organiser per RSVP submission.
          Message and data rates may apply.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-gray-900 mb-2">Data We Collect</h2>
        <p>
          The RSVP form collects your name and attendance status. This information is stored
          securely and used only to plan the event. It is not sold or shared with third parties.
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
