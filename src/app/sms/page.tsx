import type { Metadata } from 'next'
import { OptInForm, EmailForm } from './OptInForm'
import { PORTFOLIO } from '@/lib/voice/portfolio'

export const metadata: Metadata = {
  title: 'See examples of my work — Alexander Grant',
  description:
    'Links to examples of previous software development work by Alexander Grant. On the page, by email, or by text message if you would like one.',
}

/**
 * Public SMS opt-in. This page is the verifiable Call to Action for the A2P
 * 10DLC campaign, so it must stay reachable without authentication and must
 * keep the disclosures visible on the page rather than behind a link.
 *
 * Two rules here come straight from carrier review and are not cosmetic:
 *
 * 1. Nothing on this page may require the SMS checkbox. The links are printed
 *    below and can also be emailed. Making consent the only route to the content
 *    is a forced-consent violation and it failed review once already.
 * 2. The Privacy and Terms links stay outside the consent checkbox label, so
 *    ticking that box agrees to messaging and to nothing else.
 */
export default function SmsOptInPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 text-sm leading-relaxed text-gray-700">
      <p className="text-xs uppercase tracking-widest text-gray-500">Alexander Grant</p>
      <h1 className="mt-2 text-2xl font-semibold text-gray-900">See examples of my work</h1>
      <p className="mt-3">
        Alexander Grant is an independent software development consultancy. I build and run booking
        and marketing platforms for owner-operated businesses: studios, gyms, retreats, schools and
        activity centres.
      </p>

      <section className="mt-10">
        <h2 className="text-base font-semibold text-gray-900">The work</h2>
        <p className="mt-2">
          Three things I have built. No sign-up, no phone number, nothing to agree to.
        </p>
        <ul className="mt-5 space-y-4">
          {PORTFOLIO.map(item => (
            <li key={item.url} className="border-l-2 border-gray-200 pl-4">
              <a
                href={item.url}
                className="font-medium text-gray-900 underline"
                target="_blank"
                rel="noreferrer"
              >
                {item.label}
              </a>
              <p className="mt-1 text-gray-600">{item.blurb}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12 border-t border-gray-200 pt-10">
        <h2 className="text-base font-semibold text-gray-900">Want them sent to you instead?</h2>
        <p className="mt-2">Both options send the same three links. Both are optional.</p>

        <div className="mt-8">
          <h3 className="font-medium text-gray-900">By email</h3>
          <div className="mt-3">
            <EmailForm />
          </div>
        </div>

        <div className="mt-10">
          <h3 className="font-medium text-gray-900">By text message</h3>

          {/*
            The four disclosures carriers check for, in normal body text directly
            above the form, and repeated inside the consent checkbox label. Review
            rejected an earlier version for lacking "purpose details" when this
            copy lived only in small print inside that label.
          */}
          <ul className="mt-3 space-y-1.5">
            <li>
              <span className="font-medium text-gray-900">What you get:</span> one text containing
              links to examples of previous work. No marketing, no recurring promotional messages.
            </li>
            <li>
              <span className="font-medium text-gray-900">How often:</span> message frequency varies,
              typically one message per request.
            </li>
            <li>
              <span className="font-medium text-gray-900">Cost:</span> message and data rates may
              apply.
            </li>
            <li>
              <span className="font-medium text-gray-900">Opting out:</span> reply STOP to
              unsubscribe at any time, or HELP for help.
            </li>
          </ul>

          <div className="mt-6">
            <OptInForm />
          </div>

          {/* Deliberately outside the form: these are site terms, not the messaging consent. */}
          <p className="mt-4 text-xs text-gray-500">
            Alexander Grant{' '}
            <a href="/privacy" className="underline">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/terms" className="underline">
              Terms of Service
            </a>
            . Agreeing to receive text messages is not a condition of using this site or of working
            with us.
          </p>
        </div>

        <p className="mt-10 text-gray-600">
          You can also text START to{' '}
          <a href="sms:+17712533190" className="underline">
            +1 (771) 253-3190
          </a>{' '}
          to get the same links, or call the same number, where an assistant will offer to text them
          to you.
        </p>
      </section>

      <section className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="mb-3 font-semibold text-gray-900">About the text messages</h2>
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
              <a href="mailto:alexandergrantapp@gmail.com" className="underline">
                alexandergrantapp@gmail.com
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
