'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Plus, X } from 'lucide-react'

type Client = { id: string; name: string; projects: { id: string; name: string }[] }

export function NewSubscriptionForm({ clients }: { clients: Client[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')

  const selectedClient = clients.find(c => c.id === selectedClientId)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const body = {
      clientId: fd.get('clientId'),
      projectId: fd.get('projectId') || undefined,
      name: fd.get('name'),
      amount: fd.get('amount'),
      interval: fd.get('interval'),
    }
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data?.error?.issues?.[0]?.message ?? 'Failed to create subscription')
      return
    }
    setOpen(false)
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus size={14} /> New Subscription</Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-[#e8e8f0]">New Subscription</h2>
              <button onClick={() => setOpen(false)} className="text-[#6b6b8a] hover:text-[#e8e8f0]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-[#6b6b8a] mb-1.5">Client</label>
                <select
                  name="clientId"
                  required
                  value={selectedClientId}
                  onChange={e => setSelectedClientId(e.target.value)}
                  className="w-full bg-[#0e0e17] border border-[#1e1e2e] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f0] focus:outline-none focus:border-[#6c63ff]"
                >
                  <option value="">Select client…</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {selectedClient && selectedClient.projects.length > 0 && (
                <div>
                  <label className="block text-xs text-[#6b6b8a] mb-1.5">Project (optional)</label>
                  <select
                    name="projectId"
                    className="w-full bg-[#0e0e17] border border-[#1e1e2e] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f0] focus:outline-none focus:border-[#6c63ff]"
                  >
                    <option value="">No project</option>
                    {selectedClient.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs text-[#6b6b8a] mb-1.5">Subscription name</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Monthly retainer"
                  className="w-full bg-[#0e0e17] border border-[#1e1e2e] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f0] placeholder-[#6b6b8a] focus:outline-none focus:border-[#6c63ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#6b6b8a] mb-1.5">Amount (AUD)</label>
                  <input
                    name="amount"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full bg-[#0e0e17] border border-[#1e1e2e] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f0] placeholder-[#6b6b8a] focus:outline-none focus:border-[#6c63ff]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#6b6b8a] mb-1.5">Billing interval</label>
                  <select
                    name="interval"
                    required
                    className="w-full bg-[#0e0e17] border border-[#1e1e2e] rounded-lg px-3 py-2.5 text-sm text-[#e8e8f0] focus:outline-none focus:border-[#6c63ff]"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUALLY">Annually</option>
                  </select>
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex gap-3 justify-end pt-1">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
