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
    <div className="wa-form">
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={e => setName(e.target.value)}
        className="wa-input"
      />
      <textarea
        rows={4}
        placeholder="Your message..."
        value={msg}
        onChange={e => setMsg(e.target.value)}
        className="wa-input"
      />
      <button
        onClick={sendWhatsApp}
        className="wa-button"
      >
        Send via WhatsApp ↗
      </button>
    </div>
  )
}
