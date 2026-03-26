'use client'
import { useState, useEffect, Suspense } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Plus, Trash2, Zap } from 'lucide-react'

interface LineItem { description: string; quantity: string; rate: string }
interface Client { id: string; name: string; projects: { id: string; name: string }[] }

function NewInvoiceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultClientId = searchParams.get('clientId') ?? ''

  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState(defaultClientId)
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [taxRate, setTaxRate] = useState(0)
  const [items, setItems] = useState<LineItem[]>([{ description: '', quantity: '1', rate: '' }])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [mode, setMode] = useState<'itemized' | 'flat'>('itemized')
  const [flatDescription, setFlatDescription] = useState('')
  const [flatTotal, setFlatTotal] = useState('')

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setClients)
  }, [])

  const selectedClient = clients.find(c => c.id === selectedClientId)

  function updateItem(index: number, field: keyof LineItem, value: string) {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  function addItem() {
    setItems(prev => [...prev, { description: '', quantity: '1', rate: '' }])
  }

  function removeItem(index: number) {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  async function autoFillFromWorkLogs() {
    if (!selectedProjectId) return
    setLoadingLogs(true)
    try {
      const res = await fetch(`/api/work-logs/summarize?projectId=${selectedProjectId}`)
      if (!res.ok) {
        const err = await res.json()
        console.error('Auto-fill error:', err)
        return
      }
      const lineItems: LineItem[] = await res.json()
      if (lineItems.length > 0) {
        if (mode === 'flat') {
          setFlatDescription(lineItems.map(i => i.description).join('; '))
        } else {
          setItems(lineItems)
        }
      }
    } catch (e) {
      console.error('Auto-fill error:', e)
    } finally {
      setLoadingLogs(false)
    }
  }

  const subtotal = mode === 'flat'
    ? (parseFloat(flatTotal) || 0)
    : items.reduce((sum, item) => {
        const qty = parseFloat(item.quantity) || 0
        const rate = parseFloat(item.rate) || 0
        return sum + qty * rate
      }, 0)
  const tax = subtotal * (taxRate / 100)
  const total = subtotal + tax

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const submitItems = mode === 'flat'
      ? [{ description: flatDescription || 'Services rendered', quantity: '1', rate: flatTotal }]
      : items
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: selectedClientId,
        projectId: selectedProjectId || undefined,
        dueDate: fd.get('dueDate'),
        notes: fd.get('notes'),
        taxRate,
        items: submitItems,
      }),
    })
    if (res.ok) {
      const inv = await res.json()
      router.push(`/dashboard/invoices/${inv.id}`)
    } else {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/dashboard/invoices" className="text-sm text-[#6b6b8a] hover:text-[#e8e8f0] mb-4 inline-block transition-colors">← Back</Link>
        <h1 className="text-2xl font-bold text-[#e8e8f0]">New Invoice</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="font-semibold text-[#e8e8f0]">Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#e8e8f0] font-medium">Client *</label>
              <select
                value={selectedClientId}
                onChange={e => { setSelectedClientId(e.target.value); setSelectedProjectId('') }}
                required
                className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff]"
              >
                <option value="">Select a client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#e8e8f0] font-medium">Project</label>
              <select
                name="projectId"
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff]"
                disabled={!selectedClient}
              >
                <option value="">No project</option>
                {selectedClient?.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Due Date *" name="dueDate" type="date" required defaultValue={new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#e8e8f0] font-medium">Tax Rate (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
                className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff]"
              />
            </div>
          </div>
        </div>

        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold text-[#e8e8f0]">Billing</h2>
              <div className="flex bg-[#13131a] rounded-lg border border-[#1e1e2e] p-0.5">
                <button
                  type="button"
                  onClick={() => setMode('flat')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${mode === 'flat' ? 'bg-[#6c63ff] text-white' : 'text-[#6b6b8a] hover:text-[#e8e8f0]'}`}
                >
                  Flat Total
                </button>
                <button
                  type="button"
                  onClick={() => setMode('itemized')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${mode === 'itemized' ? 'bg-[#6c63ff] text-white' : 'text-[#6b6b8a] hover:text-[#e8e8f0]'}`}
                >
                  Itemized
                </button>
              </div>
            </div>
            {selectedProjectId && (
              <button
                type="button"
                onClick={autoFillFromWorkLogs}
                disabled={loadingLogs}
                className="flex items-center gap-1.5 text-xs text-[#6c63ff] hover:text-[#5a52e0] transition-colors disabled:opacity-50"
              >
                <Zap size={12} /> {loadingLogs ? 'Generating...' : 'Generate from git'}
              </button>
            )}
          </div>

          {mode === 'flat' ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[#e8e8f0] font-medium">Description</label>
                <input
                  type="text"
                  placeholder="e.g. Web development services — March 2026"
                  value={flatDescription}
                  onChange={e => setFlatDescription(e.target.value)}
                  className="w-full bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff] placeholder:text-[#6b6b8a]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-[#e8e8f0] font-medium">Total Amount *</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={flatTotal}
                  onChange={e => setFlatTotal(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff]"
                />
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-12 gap-2 text-xs text-[#6b6b8a] uppercase tracking-wider px-1">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2">Qty</div>
                  <div className="col-span-2">Rate</div>
                  <div className="col-span-2">Amount</div>
                </div>
                {items.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-6">
                      <input
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={e => updateItem(i, 'description', e.target.value)}
                        required
                        className="w-full bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6c63ff] placeholder:text-[#6b6b8a]"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="1"
                        value={item.quantity}
                        onChange={e => updateItem(i, 'quantity', e.target.value)}
                        required
                        min="0"
                        step="0.5"
                        className="w-full bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6c63ff]"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="0.00"
                        value={item.rate}
                        onChange={e => updateItem(i, 'rate', e.target.value)}
                        required
                        min="0"
                        step="0.01"
                        className="w-full bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#6c63ff]"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-between">
                      <span className="text-sm text-[#e8e8f0] font-medium">
                        ${((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)).toFixed(2)}
                      </span>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} className="text-[#6b6b8a] hover:text-red-400 transition-colors ml-2">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2 text-sm text-[#6c63ff] hover:text-[#5a52e0] transition-colors mt-2 w-fit"
              >
                <Plus size={14} /> Add item
              </button>
            </>
          )}

          <div className="border-t border-[#1e1e2e] pt-4 flex flex-col gap-2 items-end">
            <div className="flex gap-8 text-sm">
              <span className="text-[#6b6b8a]">Subtotal</span>
              <span className="text-[#e8e8f0] w-24 text-right">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex gap-8 text-sm">
              <span className="text-[#6b6b8a]">Tax ({taxRate}%)</span>
              <span className="text-[#e8e8f0] w-24 text-right">${tax.toFixed(2)}</span>
            </div>
            <div className="flex gap-8 text-base font-bold border-t border-[#1e1e2e] pt-2 mt-1">
              <span className="text-[#e8e8f0]">Total</span>
              <span className="text-[#6c63ff] w-24 text-right">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-[#e8e8f0] font-medium">Notes</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Payment terms, bank details, etc."
              className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff] resize-none placeholder:text-[#6b6b8a]"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Invoice'}</Button>
          <Link href="/dashboard/invoices"><Button type="button" variant="ghost">Cancel</Button></Link>
        </div>
      </form>
    </div>
  )
}

export default function NewInvoicePage() {
  return (
    <Suspense>
      <NewInvoiceForm />
    </Suspense>
  )
}
