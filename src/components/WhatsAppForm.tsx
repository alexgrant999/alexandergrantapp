'use client'
import { useState } from 'react'
import { sendGAEvent } from '@next/third-parties/google'

export function WhatsAppForm() {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')

  function sendWhatsApp() {
    if (!msg) return
    const text = name ? `Hi, I'm ${name}. ${msg}` : msg
    sendGAEvent('event', 'generate_lead', { method: 'whatsapp' })
    window.open('https://wa.me/12122038499?text=' + encodeURIComponent(text), '_blank')
  }

  return (
    <form className="wa-form" onSubmit={e => { e.preventDefault(); sendWhatsApp() }}>
      <label className="wa-label" htmlFor="wa-name">Your name (optional)</label>
      <input
        id="wa-name"
        type="text"
        autoComplete="name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="wa-input"
      />
      <label className="wa-label" htmlFor="wa-message">Your message</label>
      <textarea
        id="wa-message"
        rows={4}
        required
        placeholder="What do you sell, and where does it feel stuck?"
        value={msg}
        onChange={e => setMsg(e.target.value)}
        className="wa-input"
      />
      <button type="submit" className="wa-button">
        Send via WhatsApp<span aria-hidden="true"> ↗</span><span className="sr-only"> (opens WhatsApp in a new tab)</span>
      </button>
    </form>
  )
}
