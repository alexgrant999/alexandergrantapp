'use client'
import { useState, useTransition } from 'react'
import { setBookingStatusAction } from '@/app/dashboard/bookings/actions'
import type { DashboardBooking } from '@/lib/services/booking'
import { DANGER, GHOST, QUIET } from './styles'

type Mark = 'COMPLETED' | 'NO_SHOW' | 'CANCELLED'

const DONE: Record<Mark, string> = { COMPLETED: 'Marked completed.', NO_SHOW: 'Marked no show.', CANCELLED: 'Cancelled. They have been emailed.' }

const LABEL: Record<DashboardBooking['status'], { text: string; tone: string }> = {
  BOOKED: { text: 'Not marked yet', tone: 'text-[#e8e8f0]' },
  COMPLETED: { text: 'Completed', tone: 'text-[#3ecf8e]' },
  NO_SHOW: { text: 'No show', tone: 'text-[#d9b87a]' },
  CANCELLED: { text: 'Cancelled', tone: 'text-[#e07a7a]' },
}

/**
 * The marks Alex can set on one call. Ahead: cancel, asked twice because it emails the visitor.
 * Started or over: completed or no show, and either can be swapped for the other to fix a mis-click.
 * The action revalidates the page, so the row redraws (or moves table) on its own.
 */
export function BookingRowActions({ id, firstName, status, started }: { id: string; firstName: string; status: DashboardBooking['status']; started: boolean }) {
  const [pending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState('')

  const mark = (next: Mark) => {
    setMessage('')
    startTransition(async () => {
      const result = await setBookingStatusAction(id, next)
      setConfirming(false)
      setMessage(result.ok ? DONE[next] : result.error ?? 'That did not save. Try again.')
    })
  }

  const label = LABEL[status]
  const who = firstName || 'them'

  return (
    <div className="flex flex-col items-start gap-2">
      {status !== 'BOOKED' || started ? <p className={`text-sm font-medium ${label.tone}`}>{label.text}</p> : null}

      {status === 'BOOKED' && !started && !confirming && (
        <button type="button" className={DANGER} disabled={pending} onClick={() => setConfirming(true)}>Cancel call</button>
      )}
      {status === 'BOOKED' && !started && confirming && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-[#e8e8f0]">Cancel and email {who}?</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={DANGER} disabled={pending} onClick={() => mark('CANCELLED')}>{pending ? 'Cancelling…' : 'Yes, cancel'}</button>
            <button type="button" className={GHOST} disabled={pending} onClick={() => setConfirming(false)}>Keep it</button>
          </div>
        </div>
      )}

      {status === 'BOOKED' && started && (
        <div className="flex flex-wrap gap-2">
          <button type="button" className={GHOST} disabled={pending} onClick={() => mark('COMPLETED')}>Completed</button>
          <button type="button" className={GHOST} disabled={pending} onClick={() => mark('NO_SHOW')}>No show</button>
        </div>
      )}
      {status === 'COMPLETED' && (
        <button type="button" className={QUIET} disabled={pending} onClick={() => mark('NO_SHOW')}>Change to no show</button>
      )}
      {status === 'NO_SHOW' && (
        <button type="button" className={QUIET} disabled={pending} onClick={() => mark('COMPLETED')}>Change to completed</button>
      )}

      <p className="text-sm text-[#c8c8d8]" aria-live="polite">{message}</p>
    </div>
  )
}
