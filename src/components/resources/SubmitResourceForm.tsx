'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

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
      <p className="rs-share">
        <button type="button" className="rs-button" onClick={() => setOpen(true)}>Share a link</button>
      </p>
    )
  }

  return (
    <form className="rs-form" onSubmit={handleSubmit}>
      <div className="rs-form-head">
        <h2>Share a link</h2>
        <button type="button" className="rs-linkbutton" onClick={() => setOpen(false)}>Close</button>
      </div>

      {success && <p className="rs-status" role="status">Added. Thank you.</p>}
      {error && <p className="rs-status" role="alert">{error}</p>}

      <div className="rs-field">
        <label htmlFor="rs-url">Paste a link. The title, description and tags are filled in for you.</label>
        <input id="rs-url" className="rs-input" type="url" required placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} onBlur={handleUrlAnalyze} onKeyDown={handleUrlKeyDown} />
      </div>
      {analyzing && <p className="rs-note" role="status">Reading the page...</p>}

      {(analyzed || analyzing) && (
        <>
          <div className="rs-field">
            <label htmlFor="rs-title">Title</label>
            <input id="rs-title" className="rs-input" required value={title} onChange={(e) => setTitle(e.target.value)} disabled={analyzing} />
          </div>
          <div className="rs-field">
            <label htmlFor="rs-description">Description</label>
            <textarea id="rs-description" className="rs-input" value={description} onChange={(e) => setDescription(e.target.value)} disabled={analyzing} rows={2} />
          </div>
          <div className="rs-pair">
            <div className="rs-field">
              <label htmlFor="rs-tags">Tags, separated by commas</label>
              <input id="rs-tags" className="rs-input" value={tags} onChange={(e) => setTags(e.target.value)} disabled={analyzing} />
            </div>
            <div className="rs-field">
              <label htmlFor="rs-name">Your name (optional)</label>
              <input id="rs-name" className="rs-input" value={submittedBy} onChange={(e) => setSubmittedBy(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="rs-button" disabled={submitting || analyzing}>
            {submitting ? 'Sending...' : 'Add it to the list'}
          </button>
        </>
      )}
    </form>
  )
}
