import { getPortalData } from '@/lib/services/portal'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { SubscriptionActions } from './SubscriptionActions'

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const data = await getPortalData(token)
  if (!data) notFound()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '48px 24px', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif", color: 'var(--text)' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #6c63ff, #ff6584)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
            AG
          </div>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '1rem' }}>Alexander Grant</p>
            <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Client Portal</p>
          </div>
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
          Welcome, {data.client.name}
        </h1>
        {data.client.company && (
          <p style={{ color: 'var(--muted)', marginBottom: 40, fontSize: '0.95rem' }}>{data.client.company}</p>
        )}

        <section style={{ marginBottom: 40 }}>
          <h2 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 16, fontSize: '1.1rem' }}>Projects</h2>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {data.projects.length === 0 ? (
              <p style={{ padding: 24, color: 'var(--muted)', fontSize: '0.9rem' }}>No projects yet</p>
            ) : (
              data.projects.map((proj, i) => (
                <div key={proj.id} style={{ padding: '16px 24px', borderBottom: i < data.projects.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem' }}>{proj.name}</p>
                    {proj.description && <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: 2 }}>{proj.description}</p>}
                  </div>
                  <Badge status={proj.status} />
                </div>
              ))
            )}
          </div>
        </section>

        {data.subscriptions.length > 0 && (
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 16, fontSize: '1.1rem' }}>Subscriptions</h2>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
              {data.subscriptions.map((sub, i) => (
                <div key={sub.id} style={{ padding: '16px 24px', borderBottom: i < data.subscriptions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem' }}>{sub.name}</p>
                      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: 2 }}>
                        {sub.interval.charAt(0) + sub.interval.slice(1).toLowerCase()}
                        {sub.currentPeriodEnd ? ` · Renews ${formatDate(sub.currentPeriodEnd)}` : ''}
                        {sub.cancelAtPeriodEnd ? ' · Cancelling at period end' : ''}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{formatCurrency(Number(sub.amount))}</span>
                      <Badge status={sub.cancelAtPeriodEnd ? 'ON_HOLD' : sub.status} label={sub.cancelAtPeriodEnd ? 'Cancelling' : undefined} />
                    </div>
                  </div>
                  <SubscriptionActions
                    token={token}
                    subscriptionId={sub.id}
                    status={sub.status}
                    stripeCheckoutUrl={sub.stripeCheckoutUrl}
                    stripeCustomerId={sub.stripeCustomerId}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 16, fontSize: '1.1rem' }}>Invoices</h2>
          <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {data.invoices.length === 0 ? (
              <p style={{ padding: 24, color: 'var(--muted)', fontSize: '0.9rem' }}>No invoices yet</p>
            ) : (
              data.invoices.map((inv, i) => (
                <Link
                  key={inv.id}
                  href={`/portal/${token}/invoice/${inv.id}`}
                  style={{ padding: '16px 24px', borderBottom: i < data.invoices.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none' }}
                >
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.95rem' }}>{inv.number}</p>
                    <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: 2 }}>
                      Issued {formatDate(inv.issueDate)} · Due {formatDate(inv.dueDate)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.95rem' }}>{formatCurrency(Number(inv.total))}</span>
                    <Badge status={inv.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
