'use client'
import type { ReactNode } from 'react'
import { sendGAEvent } from '@next/third-parties/google'

const WHATSAPP = `https://wa.me/12122038499?text=${encodeURIComponent('Hi Alex, I’d like to talk about my business.')}`

// Same lead event the homepage form sends, so a WhatsApp message from the booking pages counts too.
export function WhatsAppLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <a
      className={className}
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => sendGAEvent('event', 'generate_lead', { method: 'whatsapp' })}
    >
      {children}<span className="sr-only"> (opens WhatsApp in a new tab)</span>
    </a>
  )
}
