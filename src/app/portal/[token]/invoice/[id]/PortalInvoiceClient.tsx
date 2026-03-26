'use client'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, CreditCard } from 'lucide-react'

interface InvoiceDetail {
  id: string
  number: string
  status: string
  issueDate: string
  dueDate: string
  subtotal: string
  tax: string
  total: string
  notes: string | null
  client: { name: string; company: string | null; portalToken: string }
  items: Array<{ id: string; description: string; quantity: string; rate: string; amount: string }>
}

export function PortalInvoiceClient({ token, id }: { token: string; id: string }) {
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [paying, setPaying] = useState(false)
  const searchParams = useSearchParams()
  const justPaid = searchParams.get('paid') === 'true'

  useEffect(() => {
    fetch(`/api/invoices/${id}`).then(r => r.json()).then(setInvoice)
  }, [id])

  async function handlePay() {
    if (!invoice) return
    setPaying(true)
    const res = await fetch(`/api/invoices/${id}/checkout`, { method: 'POST' })
    const { url } = await res.json()
    window.location.href = url
  }

  if (!invoice) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--muted)' }}>Loading...</p>
      </div>
    )
  }

  const canPay = !justPaid && (invoice.status === 'SENT' || invoice.status === 'OVERDUE')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '48px 24px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", color: 'var(--text)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #6c63ff, #ff6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>AG</div>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text)' }}>Alexander Grant</p>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Invoice</p>
          </div>
        </div>

        <Link href={`/portal/${token}`} style={{ color: 'var(--muted)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-block', marginBottom: 24 }}>
          ← Back to portal
        </Link>

        {justPaid && (
          <div style={{ background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.25)', borderRadius: 16, padding: '28px 24px', marginBottom: 24, textAlign: 'center' }}>
            <CheckCircle size={36} color="#4ade80" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#4ade80', fontWeight: 700, fontSize: '1.15rem', marginBottom: 4 }}>Payment confirmed</p>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Thank you for your payment. A receipt has been sent to your email.</p>
          </div>
        )}

        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16, padding: 32, marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{invoice.number}</h1>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
              </p>
            </div>
            <Badge status={invoice.status} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
            <div>
              <p style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>From</p>
              <p style={{ color: 'var(--text)', fontWeight: 600 }}>Alexander Grant</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>alex@alexandergrant.app</p>
            </div>
            <div>
              <p style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>To</p>
              <p style={{ color: 'var(--text)', fontWeight: 600 }}>{invoice.client.name}</p>
              {invoice.client.company && <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{invoice.client.company}</p>}
            </div>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'left', paddingBottom: 12, color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Description</th>
                <th style={{ textAlign: 'right', paddingBottom: 12, color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Qty</th>
                <th style={{ textAlign: 'right', paddingBottom: 12, color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Rate</th>
                <th style={{ textAlign: 'right', paddingBottom: 12, color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 0', color: 'var(--text)', fontSize: '0.9rem' }}>{item.description}</td>
                  <td style={{ padding: '12px 0', color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'right' }}>{Number(item.quantity)}</td>
                  <td style={{ padding: '12px 0', color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'right' }}>{formatCurrency(Number(item.rate))}</td>
                  <td style={{ padding: '12px 0', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 500, textAlign: 'right' }}>{formatCurrency(Number(item.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 48, fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--muted)' }}>Subtotal</span>
              <span style={{ color: 'var(--text)' }}>{formatCurrency(Number(invoice.subtotal))}</span>
            </div>
            <div style={{ display: 'flex', gap: 48, fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--muted)' }}>Tax</span>
              <span style={{ color: 'var(--text)' }}>{formatCurrency(Number(invoice.tax))}</span>
            </div>
            <div style={{ display: 'flex', gap: 48, fontSize: '1.1rem', fontWeight: 700, borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
              <span style={{ color: 'var(--text)' }}>Total</span>
              <span style={{ color: '#6c63ff' }}>{formatCurrency(Number(invoice.total))}</span>
            </div>
          </div>

          {invoice.notes && (
            <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Notes</p>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{invoice.notes}</p>
            </div>
          )}
        </div>

        {canPay && (
          <button
            onClick={handlePay}
            disabled={paying}
            style={{ width: '100%', background: '#6c63ff', color: 'white', border: 'none', borderRadius: 12, padding: '16px 24px', fontSize: '1rem', fontWeight: 600, cursor: paying ? 'not-allowed' : 'pointer', opacity: paying ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            <CreditCard size={18} />
            {paying ? 'Redirecting to payment...' : `Pay ${formatCurrency(Number(invoice.total))} Now`}
          </button>
        )}

        {invoice.status === 'PAID' && (
          <div style={{ background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.3)', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle size={18} color="#4ade80" />
            <p style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.9rem' }}>This invoice has been paid</p>
          </div>
        )}
      </div>
    </div>
  )
}
