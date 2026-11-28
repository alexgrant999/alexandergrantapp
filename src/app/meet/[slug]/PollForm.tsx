'use client'
import { useActionState, useEffect, useRef, useState } from 'react'
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
  closed,
}: {
  slug: string
  days: PollDay[]
  ownName: string
  ownAnswers: Record<string, 'yes' | 'maybe'>
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
