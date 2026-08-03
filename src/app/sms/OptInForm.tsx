'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitOptIn, sendExamplesByEmail, type OptInState, type EmailState } from './actions'
import { CONSENT_TEXT } from '@/lib/validators/sms-opt-in'

const initial: OptInState = { status: 'idle' }
const emailInitial: EmailState = { status: 'idle' }

export function OptInForm() {
  const [state, action] = useActionState(submitOptIn, initial)

  if (state.status === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <p className="font-medium text-green-900">You&apos;re subscribed.</p>
        <p className="mt-2 text-sm text-green-800">
          {state.delivered
            ? 'The examples are on their way to your phone.'
            : 'We could not deliver the text just now. Alex will follow up by email instead.'}
        </p>
        <p className="mt-4 text-xs text-green-700">
          Reply STOP to any message to unsubscribe, or HELP for help.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="rounded-xl border border-gray-200 p-6">
      <label className="block">
        <span className="text-sm font-medium text-gray-900">Mobile number</span>
        <input
          type="tel"
          name="phone"
          required
          autoComplete="tel"
          placeholder="(212) 203-8499"
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
        />
      </label>

      <label className="mt-5 block">
        <span className="text-sm font-medium text-gray-900">
          Name <span className="font-normal text-gray-500">(optional)</span>
        </span>
        <input
          type="text"
          name="name"
          autoComplete="given-name"
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
        />
      </label>

      {/*
        Unchecked by default and never pre-selected: carriers require active consent.
        This label covers SMS and nothing else. The Privacy and Terms links sit
        outside the form on purpose. Carrier review read the earlier version, which
        appended those links inside this same label, as bundling site terms into the
        messaging consent, which is a forced-consent violation.
      */}
      <label className="mt-6 flex items-start gap-3">
        <input
          type="checkbox"
          name="consent"
          value="yes"
          className="mt-1 h-4 w-4 shrink-0 rounded border-gray-400 accent-gray-900"
        />
        <span className="text-sm leading-relaxed text-gray-700">{CONSENT_TEXT}</span>
      </label>

      {state.status === 'error' && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {state.message}
        </p>
      )}

      <Submit />
    </form>
  )
}

export function EmailForm() {
  const [state, action] = useActionState(sendExamplesByEmail, emailInitial)

  if (state.status === 'success') {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6">
        <p className="font-medium text-green-900">Sent.</p>
        <p className="mt-2 text-sm text-green-800">
          The examples are on their way to your inbox. No text message was sent and you have not
          been subscribed to anything.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="rounded-xl border border-gray-200 p-6">
      <label className="block">
        <span className="text-sm font-medium text-gray-900">Email address</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-900"
        />
      </label>

      <p className="mt-3 text-xs text-gray-500">
        One email, sent because you asked for it. No phone number, no consent to text messages, no
        mailing list.
      </p>

      {state.status === 'error' && (
        <p className="mt-4 text-sm text-red-600" role="alert">
          {state.message}
        </p>
      )}

      <EmailSubmit />
    </form>
  )
}

function EmailSubmit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-lg border border-gray-900 px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100 disabled:opacity-50"
    >
      {pending ? 'Sending…' : 'Email them instead'}
    </button>
  )
}

function Submit() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 disabled:opacity-50"
    >
      {pending ? 'Sending…' : 'Text me the examples'}
    </button>
  )
}
