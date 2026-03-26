'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Pencil, X, ExternalLink } from 'lucide-react'

type Sub = {
  id: string
  name: string
  amount: string
  interval: string
  status: string
  cancelAtPeriodEnd: boolean
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  stripeSubscriptionId: string | null
  createdAt: string
  client: { id: string; name: string; email: string; company: string | null }
  project: { id: string; name: string } | null
}

type Payment = {
  id: string
  amount: number
  status: string
  date: string | null
  periodStart: string | null
  periodEnd: string | null
  invoiceUrl: string | null
}

function fmt(d: string | null) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d))
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

export default function SubscriptionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [sub, setSub] = useState<Sub | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loadingPayments, setLoadingPayments] = useState(true)
  const [editing, setEditing] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/subscriptions/${id}`).then(r => r.json()).then(setSub)
    fetch(`/api/subscriptions/${id}/payments`)
      .then(r => r.json())
      .then(setPayments)
      .finally(() => setLoadingPayments(false))
  }, [id])

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const fd = new FormData(e.currentTarget)
    const res = await fetch(`/api/subscriptions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: fd.get('name'),
        amount: fd.get('amount'),
        interval: fd.get('interval'),
      }),
    })
    if (res.ok) {
      const updated = await res.json()
      setSub(updated)
      setEditing(false)
    }
    setSaving(false)
  }

  async function handleCancel() {
    setCancelling(true)
    const res = await fetch(`/api/subscriptions/${id}/cancel`, { method: 'POST' })
    if (res.ok) {
      const updated = await res.json()
      setSub(s => s ? { ...s, cancelAtPeriodEnd: updated.cancelAtPeriodEnd } : s)
    }
    setCancelling(false)
  }

  if (!sub) return <div className="p-8 text-[#6b6b8a]">Loading...</div>

  const nextDue = sub.currentPeriodEnd
  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="p-8 max-w-4xl">
      <Link href="/dashboard/subscriptions" className="text-sm text-[#6b6b8a] hover:text-[#e8e8f0] mb-6 inline-block transition-colors">← Subscriptions</Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8f0]">{sub.name}</h1>
          <p className="text-[#6b6b8a] text-sm mt-1">
            {sub.client.name}{sub.client.company ? ` · ${sub.client.company}` : ''} · {fmtCurrency(Number(sub.amount))}/{sub.interval.toLowerCase()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditing(!editing)}>
            {editing ? <><X size={12} /> Cancel</> : <><Pencil size={12} /> Edit</>}
          </Button>
          {!sub.cancelAtPeriodEnd && sub.status === 'ACTIVE' && (
            <Button size="sm" variant="danger" onClick={handleCancel} disabled={cancelling}>
              {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
            </Button>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <form onSubmit={handleSave} className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Input label="Name" name="name" defaultValue={sub.name} />
            <Input label="Amount" name="amount" type="number" step="0.01" defaultValue={sub.amount} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#e8e8f0] font-medium">Interval</label>
              <select
                name="interval"
                defaultValue={sub.interval}
                className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff]"
              >
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="ANNUALLY">Annually</option>
              </select>
            </div>
          </div>
          <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
        </form>
      )}

      {/* Status cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-xl p-4">
          <p className="text-xs text-[#6b6b8a] mb-1">Status</p>
          <Badge status={sub.cancelAtPeriodEnd ? 'ON_HOLD' : sub.status} label={sub.cancelAtPeriodEnd ? 'Cancelling' : undefined} />
        </div>
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-xl p-4">
          <p className="text-xs text-[#6b6b8a] mb-1">Next Due</p>
          <p className="text-sm font-medium text-[#e8e8f0]">{fmt(nextDue)}</p>
        </div>
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-xl p-4">
          <p className="text-xs text-[#6b6b8a] mb-1">Total Paid</p>
          <p className="text-sm font-medium text-[#e8e8f0]">{fmtCurrency(totalPaid)}</p>
        </div>
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-xl p-4">
          <p className="text-xs text-[#6b6b8a] mb-1">Created</p>
          <p className="text-sm font-medium text-[#e8e8f0]">{fmt(sub.createdAt)}</p>
        </div>
      </div>

      {/* Payment history */}
      <h2 className="text-lg font-semibold text-[#e8e8f0] mb-4">Payment History</h2>
      <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="text-left px-6 py-3 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Date</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Period</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Amount</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody>
            {loadingPayments && (
              <tr><td colSpan={5} className="text-center py-8 text-[#6b6b8a] text-sm">Loading payments...</td></tr>
            )}
            {!loadingPayments && payments.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-[#6b6b8a] text-sm">No payments yet</td></tr>
            )}
            {payments.map(p => (
              <tr key={p.id} className="border-b border-[#1e1e2e] last:border-0">
                <td className="px-6 py-3 text-sm text-[#e8e8f0]">{fmt(p.date)}</td>
                <td className="px-6 py-3 text-sm text-[#6b6b8a]">{fmt(p.periodStart)} — {fmt(p.periodEnd)}</td>
                <td className="px-6 py-3 text-sm font-medium text-[#e8e8f0]">{fmtCurrency(p.amount)}</td>
                <td className="px-6 py-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    p.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400' :
                    p.status === 'open' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {p.status === 'paid' ? 'Paid' : p.status === 'open' ? 'Due' : p.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  {p.invoiceUrl && (
                    <a href={p.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-[#6b6b8a] hover:text-[#e8e8f0] transition-colors">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
