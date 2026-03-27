'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const inputStyle = {
  width: '100%',
  background: '#0a0a0f',
  border: '1px solid #1e1e2e',
  borderRadius: '8px',
  padding: '10px 14px',
  color: '#e8e8f0',
  fontSize: '.9rem',
  outline: 'none',
} as const

export function SubmitResourceForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [submittedBy, setSubmittedBy] = useState('')
  const [image, setImage] = useState('')
  const [analyzed, setAnalyzed] = useState(false)
  const lastAnalyzedUrl = useRef('')

  async function handleUrlAnalyze() {
    if (!url || url === lastAnalyzedUrl.current) return
    try {
      new URL(url)
    } catch {
      return
    }

    lastAnalyzedUrl.current = url
    setAnalyzing(true)
    setAnalyzed(false)
    setError(null)
    setTitle('')
    setDescription('')
    setTags('')
    setImage('')

    try {
      const res = await fetch('/api/resources/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(30000),
      })

      if (res.ok) {
        const data = await res.json()
        setTitle(data.title || new URL(url).hostname.replace('www.', ''))
        setDescription(data.description || '')
        setTags(data.tags?.join(', ') || '')
        setImage(data.image || '')
      } else {
        setTitle(new URL(url).hostname.replace('www.', ''))
      }
    } catch {
      setTitle(new URL(url).hostname.replace('www.', ''))
    } finally {
      setAnalyzed(true)
      setAnalyzing(false)
    }
  }

  function handleUrlKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      ;(e.target as HTMLInputElement).blur()
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (analyzing || !title) return
    setSubmitting(true)
    setError(null)

    const tagList = tags
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : []

    const res = await fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        title,
        description: description || undefined,
        image: image || undefined,
        submittedBy: submittedBy || undefined,
        tags: tagList,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      const msg = data.error
        ? typeof data.error === 'string' ? data.error : Object.values(data.error).flat().join('. ')
        : 'Failed to submit'
      setError(msg)
      setSubmitting(false)
      return
    }

    setSuccess(true)
    setSubmitting(false)
    setUrl('')
    setTitle('')
    setDescription('')
    setTags('')
    setSubmittedBy('')
    setImage('')
    setAnalyzed(false)
    lastAnalyzedUrl.current = ''
    router.refresh()
    setTimeout(() => {
      setSuccess(false)
      setOpen(false)
    }, 2000)
  }

  if (!open) {
    return (
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <button
          onClick={() => setOpen(true)}
          style={{
            background: '#6c63ff',
            color: '#fff',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '10px',
            fontSize: '.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background .15s',
          }}
          onMouseOver={(e) => (e.currentTarget.style.background = '#5a52e0')}
          onMouseOut={(e) => (e.currentTarget.style.background = '#6c63ff')}
        >
          + Share a Resource
        </button>
      </div>
    )
  }

  return (
    <div style={{
      background: '#16161f',
      border: '1px solid #1e1e2e',
      borderRadius: '16px',
      padding: '28px',
      marginBottom: '32px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Share a Resource</h3>
        <button
          onClick={() => setOpen(false)}
          style={{ background: 'none', border: 'none', color: '#6b6b8a', cursor: 'pointer', fontSize: '1.2rem' }}
        >
          x
        </button>
      </div>

      {success && (
        <div style={{ background: 'rgba(34,197,94,.12)', color: '#4ade80', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '.85rem' }}>
          Resource added!
        </div>
      )}

      {error && (
        <div style={{ background: 'rgba(239,68,68,.12)', color: '#f87171', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '.85rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ fontSize: '.8rem', color: '#6b6b8a', display: 'block', marginBottom: '4px' }}>
            Paste a URL — AI fills in the rest
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="url"
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onBlur={handleUrlAnalyze}
              onKeyDown={handleUrlKeyDown}
              style={inputStyle}
            />
            {analyzing && (
              <div style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#6c63ff',
                fontSize: '.78rem',
                fontWeight: 500,
              }}>
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', width: '14px', height: '14px', border: '2px solid #6c63ff', borderTopColor: 'transparent', borderRadius: '50%' }} />
                Analyzing...
              </div>
            )}
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>

        {(analyzed || analyzing) && (
          <>
            <div>
              <label style={{ fontSize: '.8rem', color: '#6b6b8a', display: 'block', marginBottom: '4px' }}>Title</label>
              <input
                required
                placeholder={analyzing ? 'Generating...' : 'Resource name'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={analyzing}
                style={{ ...inputStyle, opacity: analyzing ? 0.5 : 1 }}
              />
            </div>
            <div>
              <label style={{ fontSize: '.8rem', color: '#6b6b8a', display: 'block', marginBottom: '4px' }}>Description</label>
              <textarea
                placeholder={analyzing ? 'Generating...' : 'Brief description'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={analyzing}
                rows={2}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', opacity: analyzing ? 0.5 : 1 }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '.8rem', color: '#6b6b8a', display: 'block', marginBottom: '4px' }}>Tags</label>
                <input
                  placeholder={analyzing ? 'Generating...' : 'ai, skills, tools'}
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={analyzing}
                  style={{ ...inputStyle, opacity: analyzing ? 0.5 : 1 }}
                />
              </div>
              <div>
                <label style={{ fontSize: '.8rem', color: '#6b6b8a', display: 'block', marginBottom: '4px' }}>Your Name</label>
                <input
                  placeholder="Optional"
                  value={submittedBy}
                  onChange={(e) => setSubmittedBy(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting || analyzing}
              style={{
                background: submitting || analyzing ? '#3a3a55' : '#6c63ff',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                fontSize: '.9rem',
                fontWeight: 600,
                cursor: submitting || analyzing ? 'not-allowed' : 'pointer',
                alignSelf: 'flex-start',
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Resource'}
            </button>
          </>
        )}
      </form>
    </div>
  )
}
