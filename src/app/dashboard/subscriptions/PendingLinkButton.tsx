'use client'
import { useState } from 'react'
import { Copy, Check, Link } from 'lucide-react'

export function PendingLinkButton({ subscriptionId }: { subscriptionId: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  async function getLink() {
    setLoading(true)
    const res = await fetch(`/api/subscriptions/${subscriptionId}/checkout-url`)
    if (res.ok) {
      const data = await res.json()
      setUrl(data.url)
      await navigator.clipboard.writeText(data.url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    setLoading(false)
  }

  async function copyAgain() {
    if (!url) return
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (url) {
    return (
      <button
        onClick={copyAgain}
        className="flex items-center gap-1 text-xs font-medium text-[#6c63ff] hover:text-[#8b85ff] transition-colors"
      >
        {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy link</>}
      </button>
    )
  }

  return (
    <button
      onClick={getLink}
      disabled={loading}
      className="flex items-center gap-1 text-xs font-medium text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50"
    >
      <Link size={11} />
      {loading ? 'Getting link…' : 'Get link'}
    </button>
  )
}
