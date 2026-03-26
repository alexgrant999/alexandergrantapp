'use client'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Send, CheckCircle, Copy, ExternalLink, Pencil, Trash2, X } from 'lucide-react'
import { use } from 'react'

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
  client: { id: string; name: string; email: string; company: string | null; portalToken: string }
  project: { id: string; name: string } | null
  items: Array<{ id: string; description: string; quantity: string; rate: string; amount: string }>
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [emailTo, setEmailTo] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')

  useEffect(() => {
    fetch(`/api/invoices/${id}`).then(r => r.json()).then(setInvoice)
  }, [id])

  async function openEmailPreview() {
    const res = await fetch(`/api/invoices/${id}/send`)
    const defaults = await res.json()
    setEmailTo(defaults.to)
    setEmailSubject(defaults.subject)
    setEmailBody(defaults.body)
    setShowEmailModal(true)
  }

  async function sendInvoice() {
    setLoading(true)
    setAction('send')
    await fetch(`/api/invoices/${id}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: emailTo, subject: emailSubject, body: emailBody }),
    })
    setShowEmailModal(false)
    const updated = await fetch(`/api/invoices/${id}`).then(r => r.json())
    setInvoice(updated)
    setLoading(false)
    setAction(null)
  }

  async function markPaid() {
    setLoading(true)
    setAction('paid')
    await fetch(`/api/invoices/${id}/mark-paid`, { method: 'POST' })
    const updated = await fetch(`/api/invoices/${id}`).then(r => r.json())
    setInvoice(updated)
    setLoading(false)
    setAction(null)
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setLoading(true)
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    router.push('/dashboard/invoices')
  }

  function copyPortalLink() {
    if (!invoice) return
    navigator.clipboard.writeText(`${window.location.origin}/portal/${invoice.client.portalToken}/invoice/${invoice.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!invoice) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-[#1e1e2e] rounded w-48 mb-4" />
          <div className="h-4 bg-[#1e1e2e] rounded w-32" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/dashboard/invoices" className="text-sm text-[#6b6b8a] hover:text-[#e8e8f0] mb-4 inline-block transition-colors">← Invoices</Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#e8e8f0]">{invoice.number}</h1>
            <p className="text-[#6b6b8a] mt-1">{invoice.client.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge status={invoice.status} />
            {invoice.status === 'DRAFT' && (
              <>
                <Link href={`/dashboard/invoices/${invoice.id}/edit`}>
                  <Button size="sm" variant="ghost"><Pencil size={12} /> Edit</Button>
                </Link>
                <Button onClick={openEmailPreview} size="sm">
                  <Send size={12} /> Send Invoice
                </Button>
              </>
            )}
            {invoice.status === 'SENT' && (
              <Button onClick={markPaid} disabled={loading && action === 'paid'} size="sm" variant="ghost">
                <CheckCircle size={12} /> Mark as Paid
              </Button>
            )}
            <Button onClick={handleDelete} disabled={loading} size="sm" variant="ghost">
              <Trash2 size={12} /> {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-xs text-[#6b6b8a] uppercase tracking-wider mb-1">Client</p>
              <Link href={`/dashboard/clients/${invoice.client.id}`} className="text-sm text-[#e8e8f0] hover:text-[#6c63ff] font-medium transition-colors">
                {invoice.client.name}
              </Link>
              {invoice.client.company && <p className="text-xs text-[#6b6b8a]">{invoice.client.company}</p>}
            </div>
            <div>
              <p className="text-xs text-[#6b6b8a] uppercase tracking-wider mb-1">Issue Date</p>
              <p className="text-sm text-[#e8e8f0]">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-[#6b6b8a] uppercase tracking-wider mb-1">Due Date</p>
              <p className="text-sm text-[#e8e8f0]">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          {invoice.project && (
            <div className="mb-6">
              <p className="text-xs text-[#6b6b8a] uppercase tracking-wider mb-1">Project</p>
              <Link href={`/dashboard/projects/${invoice.project.id}`} className="text-sm text-[#e8e8f0] hover:text-[#6c63ff] transition-colors">
                {invoice.project.name}
              </Link>
            </div>
          )}

          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1e1e2e]">
                <th className="text-left pb-3 text-xs text-[#6b6b8a] uppercase tracking-wider">Description</th>
                <th className="text-right pb-3 text-xs text-[#6b6b8a] uppercase tracking-wider">Qty</th>
                <th className="text-right pb-3 text-xs text-[#6b6b8a] uppercase tracking-wider">Rate</th>
                <th className="text-right pb-3 text-xs text-[#6b6b8a] uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map(item => (
                <tr key={item.id} className="border-b border-[#1e1e2e] last:border-0">
                  <td className="py-3 text-sm text-[#e8e8f0]">{item.description}</td>
                  <td className="py-3 text-sm text-[#6b6b8a] text-right">{Number(item.quantity)}</td>
                  <td className="py-3 text-sm text-[#6b6b8a] text-right">{formatCurrency(Number(item.rate))}</td>
                  <td className="py-3 text-sm text-[#e8e8f0] font-medium text-right">{formatCurrency(Number(item.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col gap-2 items-end mt-4 pt-4 border-t border-[#1e1e2e]">
            <div className="flex gap-12 text-sm">
              <span className="text-[#6b6b8a]">Subtotal</span>
              <span className="text-[#e8e8f0]">{formatCurrency(Number(invoice.subtotal))}</span>
            </div>
            <div className="flex gap-12 text-sm">
              <span className="text-[#6b6b8a]">Tax</span>
              <span className="text-[#e8e8f0]">{formatCurrency(Number(invoice.tax))}</span>
            </div>
            <div className="flex gap-12 text-base font-bold mt-2">
              <span className="text-[#e8e8f0]">Total</span>
              <span className="text-[#6c63ff]">{formatCurrency(Number(invoice.total))}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-6 pt-6 border-t border-[#1e1e2e]">
              <p className="text-xs text-[#6b6b8a] uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-[#6b6b8a]">{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
          <p className="text-xs text-[#6b6b8a] uppercase tracking-wider mb-3">Client Portal Link</p>
          <div className="flex items-center gap-3">
            <p className="text-sm text-[#6b6b8a] font-mono flex-1 truncate">
              /portal/{invoice.client.portalToken}/invoice/{invoice.id}
            </p>
            <button
              onClick={copyPortalLink}
              className="flex items-center gap-1.5 text-xs text-[#6c63ff] hover:text-[#5a52e0] transition-colors"
            >
              <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
            </button>
            <a
              href={`/portal/${invoice.client.portalToken}/invoice/${invoice.id}`}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 text-xs text-[#6b6b8a] hover:text-[#e8e8f0] transition-colors"
            >
              <ExternalLink size={12} /> Preview
            </a>
          </div>
        </div>
      </div>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl w-full max-w-lg flex flex-col gap-5 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#e8e8f0]">Send Invoice Email</h2>
              <button onClick={() => setShowEmailModal(false)} className="text-[#6b6b8a] hover:text-[#e8e8f0] transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[#e8e8f0] font-medium">To</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={e => setEmailTo(e.target.value)}
                  className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[#e8e8f0] font-medium">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={e => setEmailSubject(e.target.value)}
                  className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[#e8e8f0] font-medium">Message</label>
                <textarea
                  value={emailBody}
                  onChange={e => setEmailBody(e.target.value)}
                  rows={4}
                  className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff] resize-none"
                />
              </div>
              <p className="text-xs text-[#6b6b8a]">The invoice details, totals, and payment link will be included automatically below your message.</p>
            </div>

            <div className="flex gap-3 justify-end">
              <Button onClick={() => setShowEmailModal(false)} variant="ghost" size="sm">Cancel</Button>
              <Button onClick={sendInvoice} disabled={loading && action === 'send'} size="sm">
                <Send size={12} /> {loading && action === 'send' ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
