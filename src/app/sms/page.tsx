import type { Metadata } from 'next'
import { OptInForm } from './OptInForm'

export const metadata: Metadata = {
  title: 'Text me examples of my work — Alexander Grant',
  description:
    'Opt in to receive a text message from Alexander Grant containing links to examples of previous software development work.',
}

/**
 * Public SMS opt-in. This page is the verifiable Call to Action for the A2P
 * 10DLC campaign, so it must stay reachable without authentication and must
 * keep the disclosures visible on the page rather than behind a link.
 */
export default function SmsOptInPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-sm leading-relaxed text-gray-700">
      <p className="text-xs uppercase tracking-widest text-gray-500">Alexander Grant</p>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">Text me examples of my work</h1>
      <p className="mt-3">
        Alexander Grant is an independent software development consultancy. I build and run booking
        and marketing platforms for owner-operated businesses: studios, gyms, retreats, schools and
        activity centres.
      </p>
      <p className="mt-3">
        Enter your mobile number below and I&apos;ll text you links to three things I&apos;ve built.
        You can also reach the same thing by calling{' '}
        <a href="tel:+17712533190" className="underline">
          +1 (771) 253-3190
        </a>
        , where an assistant will offer to text them to you.
      </p>

      <div className="mt-8">
        <OptInForm />
      </div>

      <section className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="mb-3 font-semibold text-gray-900">About these messages</h2>
        <dl className="space-y-3">
          <div>
            <dt className="font-medium text-gray-900">What you&apos;ll receive</dt>
            <dd>
              One text containing links to examples of previous work. No marketing campaigns, no
              recurring promotional messages.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">Message frequency</dt>
            <dd>Varies. Typically one message per request.</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">Cost</dt>
            <dd>Message and data rates may apply.</dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">Opting out</dt>
            <dd>
              Reply STOP to any message to unsubscribe. Reply HELP for help, or email{' '}
              <a href="mailto:alex@alexandergrant.app" className="underline">
                alex@alexandergrant.app
              </a>
              .
            </dd>
          </div>
          <div>
            <dt className="font-medium text-gray-900">Your number</dt>
            <dd>
              Used only to send you the messages described above. Never sold, rented or shared with
              third parties for marketing. See the{' '}
              <a href="/privacy" className="underline">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="/terms" className="underline">
                Terms of Service
              </a>
              .
            </dd>
          </div>
        </dl>
      </section>
    </main>
  )
}
