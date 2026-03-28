'use client'
import { useState } from 'react'

export function SubscriptionActions({
  token,
  subscriptionId,
  status,
  stripeCheckoutUrl,
  stripeCustomerId,
}: {
  token: string
  subscriptionId: string
  status: string
  stripeCheckoutUrl: string | null
  stripeCustomerId: string | null
}) {
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  async function openBillingPortal() {
    setLoadingPortal(true)
    const res = await fetch('/api/portal/billing-portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    }
    setLoadingPortal(false)
  }

  async function getActivationLink() {
    setLoadingCheckout(true)
    const res = await fetch(`/api/subscriptions/${subscriptionId}/checkout-url`)
    if (res.ok) {
      const { url } = await res.json()
      window.location.href = url
    }
    setLoadingCheckout(false)
  }

  if (status === 'PENDING') {
    const href = stripeCheckoutUrl ?? null
    return (
      <div style={{ marginTop: 12 }}>
        {href ? (
          <a
            href={href}
            style={{ display: 'inline-block', background: '#6c63ff', color: 'white', padding: '8px 20px', borderRadius: 8, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
          >
            Activate subscription →
          </a>
        ) : (
          <button
            onClick={getActivationLink}
            disabled={loadingCheckout}
            style={{ background: '#6c63ff', color: 'white', padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', opacity: loadingCheckout ? 0.6 : 1 }}
          >
            {loadingCheckout ? 'Loading…' : 'Activate subscription →'}
          </button>
        )}
      </div>
    )
  }

  if (status === 'ACTIVE' && stripeCustomerId) {
    return (
      <div style={{ marginTop: 12 }}>
        <button
          onClick={openBillingPortal}
          disabled={loadingPortal}
          style={{ background: 'transparent', color: 'var(--muted)', padding: '6px 0', border: 'none', fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline', opacity: loadingPortal ? 0.6 : 1 }}
        >
          {loadingPortal ? 'Opening…' : 'Manage billing & payment method →'}
        </button>
      </div>
    )
  }

  return null
}
