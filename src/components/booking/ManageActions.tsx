'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { cancelBookingAction, rescheduleBookingAction } from '@/app/book/manage/[token]/actions'

type Result = { ok: boolean; error?: string }

function useBookingAction(run: () => Promise<Result>, done: string) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  const go = () => {
    setMessage('')
    startTransition(async () => {
      const result = await run()
      if (!result.ok) {
        setMessage(result.error ?? 'That didn’t go through. Please try again, or reply to your confirmation email.')
        return
      }
      router.replace(done)
    })
  }

  return { pending, message, go }
}

/** The second ask before a cancellation. Keeping the call is the quiet option beside it. */
export function CancelCall({ token, base }: { token: string; base: string }) {
  const { pending, message, go } = useBookingAction(() => cancelBookingAction(token), `${base}?cancelled=1`)
  return (
    <>
      <div className="bk-actions">
        <button type="button" className="bk-button" disabled={pending} onClick={go}>
          {pending ? 'Cancelling…' : 'Yes, cancel the call'}
        </button>
        <Link className="bk-textlink" href={base}>No, keep it</Link>
      </div>
      <p className="bk-error" aria-live="polite" role="status">{message}</p>
    </>
  )
}

export function MoveCall({ token, startsAt, base, chooseTimeHref, label }: { token: string; startsAt: string; base: string; chooseTimeHref: string; label: string }) {
  const { pending, message, go } = useBookingAction(() => rescheduleBookingAction(token, startsAt), `${base}?moved=1`)
  return (
    <>
      <div className="bk-actions">
        <button type="button" className="bk-button" disabled={pending} onClick={go}>
          {pending ? 'Moving your call…' : label}
        </button>
        <Link className="bk-textlink" href={chooseTimeHref} prefetch={false}>Pick another time</Link>
      </div>
      <p className="bk-error" aria-live="polite" role="status">{message}</p>
    </>
  )
}
