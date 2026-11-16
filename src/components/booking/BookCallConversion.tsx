'use client'
import { useEffect } from 'react'

type Tagged = Window & { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] }

// Inlined at build. Both must be set for the Google Ads conversion to fire.
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
const ADS_LABEL = process.env.NEXT_PUBLIC_GOOGLE_ADS_BOOK_CALL_LABEL

/**
 * Sends the book_call conversion once per booking. sessionStorage remembers the booking id,
 * so a reload or a second visit to the thanks page in the same tab does not count twice, and
 * the booking id goes out as transaction_id so GA4 and Google Ads can drop a repeat anyway.
 * GA loads after hydration, so it waits up to ten seconds for gtag or dataLayer to appear.
 * Carries nothing about the person, only that a call was booked.
 */
export function BookCallConversion({ bookingId }: { bookingId: string }) {
  useEffect(() => {
    const key = `book_call:${bookingId}`
    let timer: number | undefined
    let tries = 0

    const send = () => {
      try {
        if (sessionStorage.getItem(key)) return
      } catch {
        // Storage blocked: still send, once for this page view.
      }
      const w = window as Tagged
      if (!w.gtag && !w.dataLayer) {
        if (++tries < 40) timer = window.setTimeout(send, 250)
        return
      }
      try {
        sessionStorage.setItem(key, '1')
      } catch {
        // Storage blocked.
      }
      w.gtag?.('event', 'book_call', { transaction_id: bookingId })
      w.dataLayer?.push({ event: 'book_call', transaction_id: bookingId })
      if (ADS_ID && ADS_LABEL) w.gtag?.('event', 'conversion', { send_to: `${ADS_ID}/${ADS_LABEL}`, transaction_id: bookingId })
    }

    send()
    return () => window.clearTimeout(timer)
  }, [bookingId])

  return null
}
