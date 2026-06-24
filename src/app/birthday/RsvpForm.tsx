'use client'

import { useActionState } from 'react'
import { submitRsvp, type RsvpState } from './actions'

const initial: RsvpState = { status: 'idle' }

const styles = `
  .rsvp { width: min(440px, 100%); margin: 0 auto; text-align: center; }
  .rsvp-panel {
    border: 1px solid rgba(236,212,163,.32);
    border-radius: 18px;
    padding: clamp(26px, 5vw, 38px) clamp(22px, 5vw, 36px);
    background: linear-gradient(180deg, rgba(20,24,46,.42), rgba(8,12,28,.5));
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
  .rsvp-eyebrow {
    font-family: var(--font-sans);
    font-weight: 400; font-size: clamp(13px, 1.7vw, 16px);
    letter-spacing: .26em; text-transform: uppercase;
    color: var(--accent); padding-left: .26em;
  }
  .rsvp label.field { display: block; text-align: left; margin-top: 22px; }
  .rsvp .field-label {
    font-family: var(--font-sans); font-size: 11px; font-weight: 400;
    letter-spacing: .18em; text-transform: uppercase;
    color: rgba(243,236,221,.55); padding-left: .18em;
  }
  .rsvp input.name {
    width: 100%; margin-top: 9px; padding: 10px 2px;
    background: transparent; border: 0; border-bottom: 1px solid rgba(236,212,163,.34);
    color: var(--cream); font-family: var(--font-display); font-size: 22px;
    outline: none; transition: border-color .25s ease;
  }
  .rsvp input.name::placeholder { color: rgba(243,236,221,.3); font-style: italic; }
  .rsvp input.name:focus { border-bottom-color: var(--accent); }

  .rsvp .pills { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 26px; }
  .rsvp .pill {
    position: relative; cursor: pointer; user-select: none;
    padding: 14px 10px; border-radius: 12px;
    border: 1px solid rgba(236,212,163,.28);
    font-family: var(--font-sans); font-size: clamp(12px, 1.5vw, 14px);
    letter-spacing: .08em; color: rgba(243,236,221,.78);
    transition: border-color .25s ease, color .25s ease, background .25s ease;
  }
  .rsvp .pill:hover { border-color: rgba(236,212,163,.55); color: var(--cream); }
  .rsvp .pill input { position: absolute; opacity: 0; width: 1px; height: 1px; }
  .rsvp .pill:has(input:checked) {
    background: var(--accent); border-color: var(--accent); color: #14182e; font-weight: 500;
  }
  .rsvp .pill:has(input:focus-visible) { outline: 2px solid var(--accent-soft); outline-offset: 3px; }

  .rsvp .plus-one {
    max-height: 0; opacity: 0; overflow: hidden; margin-top: 0;
    transition: max-height .4s ease, opacity .35s ease, margin-top .4s ease;
  }
  .rsvp form:has(input[name="attending"][value="yes"]:checked) .plus-one {
    max-height: 140px; opacity: 1; margin-top: 18px;
  }
  .rsvp .plus-hint {
    font-family: var(--font-sans); font-size: 11px; font-weight: 400;
    letter-spacing: .18em; text-transform: uppercase;
    color: rgba(243,236,221,.55); margin: 0 0 10px; padding-left: .18em;
  }
  .rsvp .plus-pill {
    position: relative; display: inline-flex; align-items: center; gap: 9px;
    cursor: pointer; user-select: none; padding: 12px 18px; border-radius: 12px;
    border: 1px solid rgba(236,212,163,.28);
    font-family: var(--font-sans); font-size: clamp(12px, 1.5vw, 14px); letter-spacing: .08em;
    color: rgba(243,236,221,.78);
    transition: border-color .25s ease, color .25s ease, background .25s ease;
  }
  .rsvp .plus-pill:hover { border-color: rgba(236,212,163,.55); color: var(--cream); }
  .rsvp .plus-pill input { position: absolute; opacity: 0; width: 1px; height: 1px; }
  .rsvp .plus-pill .box {
    width: 18px; height: 18px; border-radius: 5px; flex-shrink: 0;
    border: 1px solid rgba(236,212,163,.5); display: grid; place-items: center;
    font-size: 12px; line-height: 1; color: transparent; transition: all .2s ease;
  }
  .rsvp .plus-pill:has(input:checked) { background: var(--accent); border-color: var(--accent); color: #14182e; font-weight: 500; }
  .rsvp .plus-pill:has(input:checked) .box { background: #14182e; border-color: #14182e; color: var(--accent-soft); }
  .rsvp .plus-pill:has(input:focus-visible) { outline: 2px solid var(--accent-soft); outline-offset: 3px; }

  .rsvp button.submit {
    width: 100%; margin-top: 26px; padding: 15px;
    border: 0; border-radius: 12px; cursor: pointer;
    background: var(--accent); color: #14182e;
    font-family: var(--font-sans); font-weight: 500; font-size: 15px;
    letter-spacing: .14em; text-transform: uppercase; padding-left: .14em;
    transition: transform .18s ease, box-shadow .25s ease, opacity .2s ease;
    box-shadow: 0 10px 30px -12px rgba(217,184,122,.7);
  }
  .rsvp button.submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 14px 34px -12px rgba(217,184,122,.9); }
  .rsvp button.submit:disabled { opacity: .55; cursor: default; box-shadow: none; }

  .rsvp .err { margin-top: 14px; font-family: var(--font-sans); font-size: 13px; color: #f0b8a8; }
  .rsvp .fallback {
    margin-top: 18px; font-family: var(--font-sans); font-weight: 300;
    font-size: clamp(11px, 1.4vw, 13px); letter-spacing: .14em; text-transform: uppercase;
    color: rgba(243,236,221,.45);
  }
  .rsvp .fallback a { color: rgba(243,236,221,.7); text-decoration: none; border-bottom: 1px solid rgba(236,212,163,.4); }

  .rsvp .confirm-head {
    font-style: italic; font-weight: 500; color: var(--accent);
    font-size: clamp(30px, 6vw, 46px); line-height: 1; margin-bottom: 14px;
  }
  .rsvp .confirm-body { font-size: clamp(18px, 2.8vw, 23px); line-height: 1.45; color: var(--cream); }
`

export function RsvpForm() {
  const [state, formAction, isPending] = useActionState(submitRsvp, initial)

  if (state.status === 'success') {
    const coming = state.attending
    return (
      <div className="rsvp">
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="rsvp-panel" role="status">
          <div className="confirm-head">{coming ? 'See you there.' : 'You’ll be missed.'}</div>
          <p className="confirm-body">
            {coming
              ? `Wonderful, ${state.name}. We can’t wait to celebrate with you${state.plusOne ? ' and your +1' : ''} by the harbor.`
              : `Thank you for letting us know, ${state.name}. We’ll raise a glass to you under the fireworks.`}
          </p>
          <p className="fallback">
            Made a mistake? <a href="sms:+12122038499">Text 212-203-8499</a>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="rsvp">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <form action={formAction} className="rsvp-panel">
        <div className="rsvp-eyebrow">Kindly Reply</div>

        <label className="field">
          <span className="field-label">Your name</span>
          <input
            className="name"
            name="name"
            type="text"
            required
            maxLength={80}
            autoComplete="name"
            placeholder="e.g. Jordan Ellis"
          />
        </label>

        <fieldset className="pills" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="field-label" style={{ gridColumn: '1 / -1', marginBottom: 4 }}>
            Will you join us?
          </legend>
          <label className="pill">
            <input type="radio" name="attending" value="yes" required />
            Joyfully accepts
          </label>
          <label className="pill">
            <input type="radio" name="attending" value="no" required />
            Regretfully declines
          </label>
        </fieldset>

        <div className="plus-one">
          <p className="plus-hint">Bringing someone?</p>
          <label className="plus-pill">
            <input type="checkbox" name="plusOne" value="yes" />
            <span className="box" aria-hidden>✓</span>
            I’m bringing a +1
          </label>
        </div>

        <button className="submit" type="submit" disabled={isPending}>
          {isPending ? 'Sending…' : 'Send RSVP'}
        </button>

        {state.status === 'error' && <p className="err">{state.message}</p>}

        <p className="fallback">
          Prefer to text? <a href="sms:+12122038499">212-203-8499</a>
        </p>
      </form>
    </div>
  )
}
