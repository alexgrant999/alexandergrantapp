'use client'
import { useLinkStatus } from 'next/link'

// Always rendered, so the row never shifts. The row styles itself from .is-on through :has().
export function PendingHint() {
  const { pending } = useLinkStatus()
  return <span aria-hidden="true" className={pending ? 'bk-pending is-on' : 'bk-pending'} />
}
