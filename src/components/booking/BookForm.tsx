'use client'
import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { bookCallAction, type BookFormState } from '@/app/book/actions'
import { WhatsAppLink } from './ContactLinks'

const NEED_MAX = 600
const FIELDS = ['name', 'email', 'business', 'need', 'phone'] as const
type Field = (typeof FIELDS)[number]

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="bk-button" disabled={pending}>
      {pending ? 'Booking your call…' : label}
    </button>
  )
}

/**
 * Name, email, business and what they need. Success redirects on the server to
 * /book/thanks, so state only ever carries errors. Fields are controlled so a
 * failed submit never wipes what the visitor typed.
 */
export function BookForm({
  startsAt,
  timezone,
  source,
  attribution,
  startedAt,
  submitLabel,
  chooseTimeHref,
  smsEnabled = false,
}: {
  startsAt: string
  timezone: string
  source: string
  /** gclid, utm_campaign and the rest, under the names the action reads. */
  attribution: Record<string, string>
  /** Server time when this step rendered, so the bot check compares one clock with itself. */
  startedAt: number
  /** "Book Tuesday at 10:30 am" */
  submitLabel: string
  chooseTimeHref: string
  /** Shows the optional text reminder. Off until texts are set up. */
  smsEnabled?: boolean
}) {
  const [state, formAction] = useActionState<BookFormState, FormData>(bookCallAction, {})
  const [values, setValues] = useState<Record<Field, string>>({ name: '', email: '', business: '', need: '', phone: '' })
  const [smsConsent, setSmsConsent] = useState(false)
  // The first render's time, kept through a time zone change: that re-renders the step with a new
  // startedAt while the typed answers stay, and a quick submit after it would be dropped as a bot.
  const [firstStartedAt] = useState(startedAt)
  const formRef = useRef<HTMLFormElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)
  const errors = state.fieldErrors ?? {}
  const fieldErrorCount = FIELDS.filter(f => errors[f]).length

  // After a failed submit, put the visitor on the first field that needs fixing. React clears a checkbox when
  // the action returns even though its state is unchanged, so the box is put back to match.
  useEffect(() => {
    if (consentRef.current) consentRef.current.checked = smsConsent
    const first = FIELDS.find(f => state.fieldErrors?.[f])
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
  }, [state])

  const set = (field: Field) => (e: { target: { value: string } }) => setValues(v => ({ ...v, [field]: e.target.value }))
  const describedBy = (field: Field, hint: boolean) =>
    [hint ? `bk-${field}-hint` : '', errors[field] ? `bk-${field}-error` : ''].filter(Boolean).join(' ') || undefined
  const invalid = (field: Field) => (errors[field] ? true : undefined)

  // Shown beside the button, where the visitor is looking after they tap it.
  const summary = errors.startsAt
    ? null
    : fieldErrorCount === 1 ? 'One answer needs another look.' : fieldErrorCount > 1 ? `${fieldErrorCount} answers need another look.` : state.error ?? ''

  return (
    <form ref={formRef} action={formAction} className="bk-form" noValidate>
      <input type="hidden" name="startsAt" value={startsAt} />
      <input type="hidden" name="timezone" value={timezone} />
      <input type="hidden" name="source" value={source} />
      <input type="hidden" name="startedAt" value={firstStartedAt} />
      {Object.entries(attribution).map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
      <div className="bk-trap" aria-hidden="true">
        <label htmlFor="bk-website">Website</label>
        <input id="bk-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="bk-field">
        <label className="bk-label" htmlFor="bk-name">Your name</label>
        <input id="bk-name" className="bk-input" name="name" type="text" autoComplete="name" maxLength={80} required
          value={values.name} onChange={set('name')} aria-invalid={invalid('name')} aria-describedby={describedBy('name', false)} />
        <p id="bk-name-error" className="bk-error">{errors.name}</p>
      </div>

      <div className="bk-field">
        <label className="bk-label" htmlFor="bk-email">Email</label>
        <p id="bk-email-hint" className="bk-hint">Your confirmation goes here.</p>
        <input id="bk-email" className="bk-input" name="email" type="email" inputMode="email" autoComplete="email" maxLength={200} required
          value={values.email} onChange={set('email')} aria-invalid={invalid('email')} aria-describedby={describedBy('email', true)} />
        <p id="bk-email-error" className="bk-error">{errors.email}</p>
      </div>

      <div className="bk-field">
        <label className="bk-label" htmlFor="bk-business">Your business</label>
        <p id="bk-business-hint" className="bk-hint">Its name, and the website if it has one.</p>
        <input id="bk-business" className="bk-input" name="business" type="text" autoComplete="organization" maxLength={120} required
          value={values.business} onChange={set('business')} aria-invalid={invalid('business')} aria-describedby={describedBy('business', true)} />
        <p id="bk-business-error" className="bk-error">{errors.business}</p>
      </div>

      <div className="bk-field">
        <label className="bk-label" htmlFor="bk-need">What would you like to talk about?</label>
        <p id="bk-need-hint" className="bk-hint">Optional, but it helps me prepare. What you sell, and what isn’t working or takes too long.</p>
        <textarea id="bk-need" className="bk-input" name="need" rows={5} maxLength={NEED_MAX}
          value={values.need} onChange={set('need')} aria-invalid={invalid('need')} aria-describedby={describedBy('need', true)} />
        <p className="bk-count" aria-hidden="true">{values.need.length} of {NEED_MAX}</p>
        <p id="bk-need-error" className="bk-error">{errors.need}</p>
      </div>

      {smsEnabled && (
        <div className="bk-field">
          {smsConsent && <input type="hidden" name="smsConsent" value="on" />}
          <label className="bk-check">
            <input ref={consentRef} type="checkbox" checked={smsConsent} onChange={e => setSmsConsent(e.target.checked)} />
            <span>Text me a reminder an hour before the call</span>
          </label>
          <p id="bk-phone-hint" className="bk-hint">Optional. One text per call, from Alex Grant. Message and data rates may apply. Reply STOP to opt out. You’ll get email reminders either way.</p>
          {smsConsent && (
            <>
              <label className="bk-label" htmlFor="bk-phone" style={{ marginTop: 14 }}>Mobile number</label>
              <input id="bk-phone" className="bk-input" name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={30} placeholder="+1 212 555 0100"
                value={values.phone} onChange={set('phone')} aria-invalid={invalid('phone')} aria-describedby={describedBy('phone', true)} />
            </>
          )}
          <p id="bk-phone-error" className="bk-error">{errors.phone}</p>
        </div>
      )}

      <div className="bk-submit">
        <SubmitButton label={submitLabel} />
        <p className="bk-error" aria-live="polite" role="status">
          {state.code === 'paused' ? (
            <>
              {state.error}{' '}
              <WhatsAppLink className="bk-textlink">Message me on WhatsApp</WhatsAppLink>{' '}or email{' '}
              <a className="bk-textlink" href="mailto:alexandergrantapp@gmail.com?subject=A%2015%20minute%20call" style={{ overflowWrap: 'anywhere' }}>alexandergrantapp@gmail.com</a>
            </>
          ) : summary ?? <>{errors.startsAt} <Link className="bk-textlink" href={chooseTimeHref} prefetch={false} scroll={false}>Pick another time</Link></>}
        </p>
        <p className="bk-hint">The call is free. You can move or cancel it from the confirmation email.</p>
      </div>
    </form>
  )
}
