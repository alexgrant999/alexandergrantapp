'use client'
import { useActionState, useEffect, useRef, useState } from 'react'
import { MEETUP_EXPERIENCE, MEETUP_INTERESTS, NOTE_MAX } from '@/lib/validators/group-poll'
import { respondAction, type RespondState } from './actions'

export type PollRow = {
  id: string
  time: string
  /** The same start in Sydney and Brisbane, leaving out the zone `time` is already in. */
  also: string
  past: boolean
  chosen: boolean
  best: boolean
  yes: string[]
  maybe: string[]
}

export type PollDay = { date: string; label: string; rows: PollRow[] }

/** This browser's earlier answers about themselves, so an update does not wipe them. */
export type OwnDetails = { email: string; phone: string; interests: string[]; experience: string; note: string }

type Answer = 'yes' | 'maybe' | 'no'

const initial: RespondState = { status: 'idle' }

function who(names: string[]): string {
  if (names.length <= 3) return names.join(', ')
  return `${names.slice(0, 3).join(', ')} and ${names.length - 3} more`
}

/**
 * The grid of times, one row each, with Can, If need be and Can't for each. Plain
 * radios named opt-<id>, so the form posts without any script beyond the action state.
 */
export function PollForm({
  slug,
  days,
  ownName,
  ownAnswers,
  ownDetails,
  closed,
}: {
  slug: string
  days: PollDay[]
  ownName: string
  ownAnswers: Record<string, 'yes' | 'maybe'>
  ownDetails: OwnDetails
  closed: boolean
}) {
  const [state, formAction, pending] = useActionState(respondAction, initial)
  const [startedAt] = useState(() => Date.now())
  const [zone, setZone] = useState('')
  const statusRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    try {
      setZone(Intl.DateTimeFormat().resolvedOptions().timeZone ?? '')
    } catch {
      setZone('')
    }
  }, [])

  useEffect(() => {
    if (state.at) statusRef.current?.focus()
  }, [state.at])

  const open = days.flatMap(d => d.rows).filter(r => !r.past)

  return (
    <form action={formAction} className="gp-form">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="startedAt" value={startedAt} />
      <input type="hidden" name="timezone" value={zone} />
      <div className="bk-trap" aria-hidden="true">
        <label>Website <input name="website" tabIndex={-1} autoComplete="off" defaultValue="" /></label>
      </div>

      <p ref={statusRef} className="bk-status" role="status" tabIndex={-1}>
        {state.status !== 'idle' ? state.message : ''}
      </p>

      <h2 className="bk-h2">{ownName ? 'Your answers' : 'When can you make it?'}</h2>
      <p className="bk-copy">
        {closed
          ? 'This poll has closed. Here is how everyone answered.'
          : 'Mark every time you could make. “If need be” helps too: it can tip a close call.'}
      </p>

      <div className="gp-days">
        {days.map(day => (
          <section key={day.date} className="gp-day" aria-labelledby={`d-${day.date}`}>
            <h3 id={`d-${day.date}`} className="gp-day-head">{day.label}</h3>
            <ul className="gp-rows">
              {day.rows.map(row => {
                const mine: Answer = ownAnswers[row.id] ?? 'no'
                const disabled = closed || row.past
                return (
                  <li key={row.id} className={`gp-row${row.chosen ? ' is-chosen' : ''}${row.best && !row.chosen ? ' is-best' : ''}${row.past ? ' is-past' : ''}`}>
                    <div className="gp-when">
                      <span className="gp-time">{row.time}</span>
                      {row.also && <span className="gp-also">{row.also}</span>}
                      {row.chosen && <span className="gp-tag">The time</span>}
                      {row.best && !row.chosen && <span className="gp-tag">Most can make this</span>}
                      {row.past && <span className="gp-tag is-quiet">Passed</span>}
                    </div>
                    <div className="gp-who">
                      <span className="gp-count">{row.yes.length} can{row.maybe.length > 0 ? `, ${row.maybe.length} if need be` : ''}</span>
                      {(row.yes.length > 0 || row.maybe.length > 0) && (
                        <span className="gp-names">
                          {who(row.yes)}
                          {row.maybe.length > 0 && <>{row.yes.length > 0 ? '; ' : ''}<i>if need be:</i> {who(row.maybe)}</>}
                        </span>
                      )}
                    </div>
                    <fieldset className="gp-choice" disabled={disabled}>
                      <legend className="sr-only">{day.label}, {row.time}{row.also ? ` (${row.also})` : ''}</legend>
                      {(['yes', 'maybe', 'no'] as const).map(value => (
                        <label key={value} className={`gp-opt is-${value}`}>
                          <input type="radio" name={`opt-${row.id}`} value={value} defaultChecked={mine === value} />
                          <span>{value === 'yes' ? 'Can' : value === 'maybe' ? 'If need be' : 'Can’t'}</span>
                        </label>
                      ))}
                    </fieldset>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>

      {!closed && open.length > 0 && (
        <div className="bk-form">
          <div className="bk-field">
            <label className="bk-label" htmlFor="gp-name">Your name</label>
            <p className="bk-hint" id="gp-name-hint">First name is fine. The group sees it next to your answers.</p>
            <input id="gp-name" className="bk-input" name="name" required maxLength={60} autoComplete="given-name" defaultValue={ownName} aria-describedby="gp-name-hint" />
          </div>
          <div className="bk-field">
            <label className="bk-label" htmlFor="gp-email">Email</label>
            <p className="bk-hint" id="gp-email-hint">Only Alex sees this. It’s for sending you the final time and the link to join.</p>
            <input id="gp-email" className="bk-input" name="email" type="email" inputMode="email" required maxLength={200} autoComplete="email" defaultValue={ownDetails.email} aria-describedby="gp-email-hint" />
          </div>
          <div className="bk-field">
            <label className="bk-label" htmlFor="gp-phone">Mobile <span className="gp-optional">(optional)</span></label>
            <p className="bk-hint" id="gp-phone-hint">Only Alex sees this. Outside Australia, start with your country code.</p>
            <input id="gp-phone" className="bk-input" name="phone" type="tel" inputMode="tel" maxLength={30} autoComplete="tel" placeholder="0412 345 678" defaultValue={ownDetails.phone} aria-describedby="gp-phone-hint" />
          </div>
          <fieldset className="bk-field gp-fieldset" aria-describedby="gp-interests-hint">
            <legend className="bk-label">What would you like to get out of it? <span className="gp-optional">(optional)</span></legend>
            <p className="bk-hint" id="gp-interests-hint">Tick any that fit. It helps shape the session.</p>
            <div className="gp-chips">
              {MEETUP_INTERESTS.map(i => (
                <label key={i.key} className="gp-chip">
                  <input type="checkbox" name="interests" value={i.key} defaultChecked={ownDetails.interests.includes(i.key)} />
                  <span>{i.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="bk-field gp-fieldset">
            <legend className="bk-label">How do you use AI now? <span className="gp-optional">(optional)</span></legend>
            <div className="gp-levels">
              {MEETUP_EXPERIENCE.map(e => (
                <label key={e.key} className="bk-check gp-level">
                  <input type="radio" name="experience" value={e.key} defaultChecked={ownDetails.experience === e.key} />
                  <span>{e.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="bk-field">
            <label className="bk-label" htmlFor="gp-note">Anything you’d like covered, or a question to bring? <span className="gp-optional">(optional)</span></label>
            <textarea id="gp-note" className="bk-input" name="note" rows={3} maxLength={NOTE_MAX} defaultValue={ownDetails.note} />
          </div>
          <div className="bk-submit">
            <button className="bk-button" type="submit" disabled={pending}>
              {pending ? 'Saving…' : ownName ? 'Update my answers' : 'Save my answers'}
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
