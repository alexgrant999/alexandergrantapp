'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import {
  addOptionsAction,
  chooseOptionAction,
  deletePollAction,
  removeOptionAction,
  removeResponseAction,
  setClosedAction,
} from '@/app/dashboard/meetups/actions'
import { alsoIn, formatDayShort, formatTime, zoneCity } from '@/components/booking/format'
import { MEETUP_ZONES } from '@/components/booking/zones'
import { DANGER, GHOST, PANEL, PRIMARY, QUIET, SECTION_LABEL } from '@/components/dashboard/bookings/styles'
import type { PollView } from '@/lib/services/group-poll'
import { MEETUP_EXPERIENCE, MEETUP_INTERESTS } from '@/lib/validators/group-poll'
import { TimesEditor, type LocalTime } from './TimesEditor'

/**
 * One poll on the dashboard: who can make which time, as a grid of people by
 * times; the share message for the group chat; and the controls to settle on a
 * time, add or drop times, and close the poll.
 */
export function PollManager({ poll }: { poll: PollView }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')
  const [copied, setCopied] = useState<'message' | 'link' | 'emails' | null>(null)
  const [adding, setAdding] = useState<LocalTime[]>([{ date: '', time: '19:00' }])

  const zone = poll.timezone
  const when = (iso: string) => `${formatDayShort(iso, zone)}, ${formatTime(iso, zone)}`
  const chosen = poll.options.find(o => o.id === poll.chosenOptionId)

  // For the group chat: the day, then the time in Sydney and in Brisbane.
  const groupWhen = (iso: string) =>
    MEETUP_ZONES.map(z => `${formatTime(iso, z)} ${zoneCity(z)}`).join(' / ')
  const share = chosen
    ? `${poll.title} is on ${formatDayShort(chosen.startsAt, MEETUP_ZONES[0])}, ${groupWhen(chosen.startsAt)}. Add it to your calendar here: ${poll.url}`
    : `Let's find a time for ${poll.title}. Tap the times you can make (Sydney and Brisbane times are both shown): ${poll.url}`

  const act = (task: () => Promise<{ ok: boolean; error?: string }>, done: string) => {
    setMessage('')
    startTransition(async () => {
      const result = await task()
      setMessage(result.ok ? done : result.error ?? 'That did not work. Try again.')
    })
  }

  const emails = [...new Set(poll.responses.map(r => r.email).filter((e): e is string => !!e))]
  const interestCounts = MEETUP_INTERESTS.map(i => ({ ...i, count: poll.responses.filter(r => r.interests?.includes(i.key)).length }))
    .filter(i => i.count > 0)
    .sort((a, b) => b.count - a.count)
  const experienceCounts = MEETUP_EXPERIENCE.map(e => ({ ...e, count: poll.responses.filter(r => r.experience === e.key).length })).filter(e => e.count > 0)
  const interestLabel = (key: string) => MEETUP_INTERESTS.find(i => i.key === key)?.label ?? key
  const experienceLabel = (key: string) => MEETUP_EXPERIENCE.find(e => e.key === key)?.label ?? key

  const copy = async (what: 'message' | 'link' | 'emails') => {
    try {
      await navigator.clipboard.writeText(what === 'link' ? poll.url : what === 'emails' ? emails.join(', ') : share)
      setCopied(what)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      setMessage('Could not copy. Select the text and copy it by hand.')
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <p role="status" className="text-sm text-[#e8e8f0] empty:hidden">{message}</p>

      <section aria-labelledby="share-heading">
        <h2 id="share-heading" className={`${SECTION_LABEL} mb-4`}>Share with the group</h2>
        <div className={`${PANEL} flex flex-col gap-3 p-6`}>
          <p className="select-all whitespace-pre-wrap break-words text-sm text-[#e8e8f0]">{share}</p>
          <div className="flex flex-wrap gap-3">
            <button type="button" className={GHOST} onClick={() => copy('message')}>{copied === 'message' ? 'Copied' : 'Copy message'}</button>
            <button type="button" className={GHOST} onClick={() => copy('link')}>{copied === 'link' ? 'Copied' : 'Copy link'}</button>
          </div>
        </div>
      </section>

      <section aria-labelledby="grid-heading">
        <h2 id="grid-heading" className={`${SECTION_LABEL} mb-4`}>Who can make what</h2>
        <div className={`${PANEL} overflow-x-auto`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#c8c8d8]">Time ({zone.split('/').pop()?.replaceAll('_', ' ')})</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-[#c8c8d8]">Can</th>
                {poll.responses.map(r => (
                  <th key={r.id} scope="col" className="px-3 py-3 text-center text-xs font-medium text-[#e8e8f0]">{r.name}</th>
                ))}
                <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {poll.options.map(o => {
                const isChosen = o.id === poll.chosenOptionId
                const isBest = o.id === poll.bestOptionId
                return (
                  <tr key={o.id} className={`border-b border-[#1e1e2e] last:border-0 ${isChosen ? 'bg-[#3ecf8e]/10' : isBest ? 'bg-[#5a52e0]/10' : ''} ${o.past ? 'opacity-50' : ''}`}>
                    <th scope="row" className="whitespace-nowrap px-4 py-3 text-left font-medium text-[#e8e8f0] tabular-nums">
                      {when(o.startsAt)}
                      {alsoIn(o.startsAt, zone, MEETUP_ZONES) && <span className="block text-xs font-normal text-[#c8c8d8]">{alsoIn(o.startsAt, zone, MEETUP_ZONES)}</span>}
                      <span className="block text-xs font-normal text-[#c8c8d8]">
                        {isChosen ? 'Settled' : isBest ? 'Best so far' : o.past ? 'Passed' : ''}
                        {o.clashes && <span className="text-[#d9b87a]">{isChosen || isBest || o.past ? ' · ' : ''}Busy on your calendar</span>}
                      </span>
                    </th>
                    <td className="px-4 py-3 tabular-nums text-[#e8e8f0]">
                      {o.tally.yes.length}{o.tally.maybe.length > 0 && <span className="text-[#c8c8d8]"> +{o.tally.maybe.length}?</span>}
                    </td>
                    {poll.responses.map(r => {
                      const a = r.yes.includes(o.id) ? 'yes' : r.maybe.includes(o.id) ? 'maybe' : 'no'
                      return (
                        <td key={r.id} className="px-3 py-3 text-center">
                          <span
                            className={`inline-block min-w-12 rounded px-2 py-0.5 text-xs ${a === 'yes' ? 'bg-[#3ecf8e]/20 text-[#3ecf8e]' : a === 'maybe' ? 'bg-[#d9b87a]/15 text-[#d9b87a]' : 'text-[#6b6b8a]'}`}
                          >
                            {a === 'yes' ? 'Can' : a === 'maybe' ? 'Maybe' : 'No'}
                          </span>
                        </td>
                      )
                    })}
                    <td className="whitespace-nowrap px-4 py-2 text-right">
                      {isChosen ? (
                        <button type="button" className={QUIET} disabled={pending} onClick={() => act(() => chooseOptionAction({ pollId: poll.id, optionId: null }), 'Unsettled. The page shows the poll again.')}>
                          Unpick
                        </button>
                      ) : (
                        <button type="button" className={QUIET} disabled={pending} onClick={() => act(() => chooseOptionAction({ pollId: poll.id, optionId: o.id }), `Settled on ${when(o.startsAt)}. The poll page now shows it with an add to calendar button.`)}>
                          Pick this<span className="sr-only"> time, {when(o.startsAt)}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        className={QUIET}
                        disabled={pending}
                        onClick={() => {
                          if (!confirm(`Remove ${when(o.startsAt)} and every answer to it?`)) return
                          act(() => removeOptionAction(poll.id, o.id), `Removed ${when(o.startsAt)}.`)
                        }}
                      >
                        Remove<span className="sr-only"> {when(o.startsAt)}</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {poll.responses.length > 0 && (
          <details className="mt-4 text-sm text-[#c8c8d8]">
            <summary className="cursor-pointer">Remove someone’s answers</summary>
            <ul className="mt-2 flex flex-wrap gap-2">
              {poll.responses.map(r => (
                <li key={r.id}>
                  <button
                    type="button"
                    className={GHOST}
                    disabled={pending}
                    onClick={() => {
                      if (!confirm(`Remove ${r.name}’s answers?`)) return
                      act(() => removeResponseAction(poll.id, r.id), `Removed ${r.name}’s answers.`)
                    }}
                  >
                    {r.name}
                  </button>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      {poll.responses.length > 0 && (
        <section aria-labelledby="people-heading">
          <h2 id="people-heading" className={`${SECTION_LABEL} mb-4`}>Who they are</h2>
          {(interestCounts.length > 0 || experienceCounts.length > 0) && (
            <div className={`${PANEL} mb-4 grid gap-6 p-6 text-sm sm:grid-cols-2`}>
              {interestCounts.length > 0 && (
                <div>
                  <h3 className="mb-2 font-medium text-[#e8e8f0]">What they want from it</h3>
                  <ul className="flex flex-col gap-1 text-[#c8c8d8]">
                    {interestCounts.map(i => (
                      <li key={i.key} className="flex justify-between gap-4"><span>{i.label}</span><span className="tabular-nums text-[#e8e8f0]">{i.count}</span></li>
                    ))}
                  </ul>
                </div>
              )}
              {experienceCounts.length > 0 && (
                <div>
                  <h3 className="mb-2 font-medium text-[#e8e8f0]">How they use AI</h3>
                  <ul className="flex flex-col gap-1 text-[#c8c8d8]">
                    {experienceCounts.map(e => (
                      <li key={e.key} className="flex justify-between gap-4"><span>{e.label}</span><span className="tabular-nums text-[#e8e8f0]">{e.count}</span></li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className={`${PANEL} overflow-x-auto`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e1e2e] text-left text-xs font-medium uppercase tracking-wider text-[#c8c8d8]">
                  <th scope="col" className="px-4 py-3">Name</th>
                  <th scope="col" className="px-4 py-3">Contact</th>
                  <th scope="col" className="px-4 py-3">Uses AI</th>
                  <th scope="col" className="px-4 py-3">Wants</th>
                  <th scope="col" className="px-4 py-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {poll.responses.map(r => (
                  <tr key={r.id} className="border-b border-[#1e1e2e] align-top last:border-0">
                    <th scope="row" className="px-4 py-3 text-left font-medium text-[#e8e8f0]">{r.name}</th>
                    <td className="px-4 py-3 text-[#c8c8d8]">
                      {r.email ? <a className="block text-[#e8e8f0] underline-offset-2 hover:underline" href={`mailto:${r.email}`}>{r.email}</a> : <span className="block">No email</span>}
                      {r.phone && <a className="block tabular-nums underline-offset-2 hover:underline" href={`tel:${r.phone}`}>{r.phone}</a>}
                    </td>
                    <td className="px-4 py-3 text-[#c8c8d8]">{r.experience ? experienceLabel(r.experience) : ''}</td>
                    <td className="px-4 py-3 text-[#c8c8d8]">{r.interests?.map(interestLabel).join('; ')}</td>
                    <td className="max-w-xs whitespace-pre-wrap break-words px-4 py-3 text-[#c8c8d8]">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {emails.length > 0 && (
            <div className="mt-4">
              <button type="button" className={GHOST} onClick={() => copy('emails')}>{copied === 'emails' ? 'Copied' : `Copy ${emails.length === 1 ? 'the email' : `all ${emails.length} emails`}`}</button>
            </div>
          )}
        </section>
      )}

      <section aria-labelledby="add-heading">
        <h2 id="add-heading" className={`${SECTION_LABEL} mb-4`}>Add times</h2>
        <div className={`${PANEL} flex flex-col gap-4 p-6`}>
          <p className="text-sm text-[#c8c8d8]">In {zone.split('/').pop()?.replaceAll('_', ' ')} time, {poll.durationMinutes} minutes each.</p>
          <TimesEditor times={adding} onChange={setAdding} disabled={pending} />
          <div>
            <button
              type="button"
              className={PRIMARY}
              disabled={pending}
              onClick={() => {
                const times = adding.filter(t => t.date && t.time)
                if (times.length === 0) return setMessage('Pick a date for the new time.')
                act(async () => {
                  const result = await addOptionsAction({ pollId: poll.id, timezone: zone, times })
                  if (result.ok) setAdding([{ date: '', time: '19:00' }])
                  return result
                }, times.length === 1 ? 'Added the time.' : `Added ${times.length} times.`)
              }}
            >
              Add to the poll
            </button>
          </div>
        </div>
      </section>

      <section aria-labelledby="manage-heading" className="flex flex-wrap gap-3">
        <h2 id="manage-heading" className="sr-only">Manage the poll</h2>
        <button
          type="button"
          className={GHOST}
          disabled={pending}
          onClick={() => act(() => setClosedAction(poll.id, !poll.closed), poll.closed ? 'Reopened. People can answer again.' : 'Closed. Answers are frozen.')}
        >
          {poll.closed ? 'Reopen the poll' : 'Close to new answers'}
        </button>
        <button
          type="button"
          className={DANGER}
          disabled={pending}
          onClick={() => {
            if (!confirm(`Delete “${poll.title}” and every answer? The link will stop working.`)) return
            startTransition(async () => {
              const result = await deletePollAction(poll.id)
              if (result.ok) router.push('/dashboard/meetups')
              else setMessage(result.error ?? 'That did not delete. Try again.')
            })
          }}
        >
          Delete poll
        </button>
      </section>
    </div>
  )
}
