'use client'
import { useState, useTransition } from 'react'
import { addTimeOffAction, removeTimeOffAction } from '@/app/dashboard/bookings/actions'
import type { TimeOffBlock } from '@/lib/services/booking'
import { formatDayShort, formatTime } from '@/components/booking/format'
import { GHOST, INPUT, PRIMARY } from './styles'

/**
 * Days or hours Alex is away. The form sends the datetime-local values as typed;
 * the service reads them on Alex's clock, so this works from any browser zone.
 */
export function TimeOffEditor({ blocks, ownerZone }: { blocks: TimeOffBlock[]; ownerZone: string }) {
  const [from, setFrom] = useState('')
  const [until, setUntil] = useState('')
  const [note, setNote] = useState('')
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  const when = (iso: string) => `${formatDayShort(iso, ownerZone)}, ${formatTime(iso, ownerZone)}`

  const add = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!from || !until) return setMessage('Pick when the time off starts and ends.')
    if (until <= from) return setMessage('The end needs to be after the start.')
    setMessage('')
    startTransition(async () => {
      const result = await addTimeOffAction({ startsAt: from, endsAt: until, note: note.trim() || undefined })
      if (!result.ok) return setMessage(result.error ?? 'That did not save. Try again.')
      setFrom('')
      setUntil('')
      setNote('')
      setMessage('Added. Those times are off the booking page now.')
    })
  }

  const remove = (block: TimeOffBlock) => {
    setMessage('')
    startTransition(async () => {
      const result = await removeTimeOffAction(block.id)
      setMessage(result.ok ? `Removed the time off from ${when(block.startsAt)}.` : result.error ?? 'That did not remove. Try again.')
    })
  }

  return (
    <div>
      {blocks.length === 0 ? (
        <p className="text-sm text-[#c8c8d8]">No time off coming up.</p>
      ) : (
        <ul className="divide-y divide-[#1e1e2e] border-y border-[#1e1e2e]">
          {blocks.map(block => (
            <li key={block.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm text-[#e8e8f0] tabular-nums">{when(block.startsAt)} to {when(block.endsAt)}</p>
                {block.note && <p className="text-sm text-[#c8c8d8]">{block.note}</p>}
              </div>
              <button type="button" className={GHOST} disabled={pending} onClick={() => remove(block)}>
                Remove<span className="sr-only"> time off from {when(block.startsAt)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[#e8e8f0]">
          From
          <input type="datetime-local" step={900} className={INPUT} value={from} onChange={e => setFrom(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[#e8e8f0]">
          Until
          <input type="datetime-local" step={900} className={INPUT} value={until} min={from || undefined} onChange={e => setUntil(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-[#e8e8f0] sm:col-span-2">
          <span>Note <span className="font-normal text-[#c8c8d8]">(optional, only you see it)</span></span>
          <input type="text" maxLength={200} className={INPUT} value={note} onChange={e => setNote(e.target.value)} />
        </label>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
          <button type="submit" className={PRIMARY} disabled={pending}>{pending ? 'Saving…' : 'Add time off'}</button>
          <p className="text-sm text-[#e8e8f0]" aria-live="polite">{message}</p>
        </div>
      </form>
      <p className="mt-4 text-sm text-[#c8c8d8]">Calls already booked inside new time off stay booked. Cancel them from the list above if you need to.</p>
    </div>
  )
}
