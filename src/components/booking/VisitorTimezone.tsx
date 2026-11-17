'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { isIanaZone } from './format'

/**
 * Puts the visitor's own time zone in the URL as ?tz=, once, and only when it is absent
 * (TimezonePicker owns it after that), so the server lists days and times on the
 * visitor's clock. router.replace, so Back never lands on the page without it.
 */
export function VisitorTimezone({ current }: { current: string | null }) {
  const router = useRouter()
  const done = useRef(false)

  useEffect(() => {
    if (done.current || current) return
    done.current = true
    let zone = ''
    try {
      zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
    } catch {
      zone = ''
    }
    if (!zone || !isIanaZone(zone)) return
    const url = new URL(window.location.href)
    url.searchParams.set('tz', zone)
    router.replace(`${url.pathname}${url.search}`, { scroll: false })
  }, [current, router])

  return null
}
