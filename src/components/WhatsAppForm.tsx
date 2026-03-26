'use client'
import { useState } from 'react'

export function WhatsAppForm() {
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')

  function sendWhatsApp() {
    if (!msg) return
    const text = name ? `Hi, I'm ${name}. ${msg}` : msg
    window.open('https://wa.me/12122038499?text=' + encodeURIComponent(text), '_blank')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        type="text"
        placeholder="Your name"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '12px 16px', fontSize: '.95rem', outline: 'none', width: '100%' }}
      />
      <textarea
        rows={4}
        placeholder="Your message..."
        value={msg}
        onChange={e => setMsg(e.target.value)}
        style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, padding: '12px 16px', fontSize: '.95rem', outline: 'none', resize: 'vertical', width: '100%', fontFamily: 'inherit' }}
      />
      <button
        onClick={sendWhatsApp}
        style={{ alignSelf: 'flex-start', padding: '10px 24px', fontSize: '.9rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}
      >
        Send via WhatsApp ↗
      </button>
    </div>
  )
}
