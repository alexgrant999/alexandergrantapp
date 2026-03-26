'use client'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus } from 'lucide-react'

const CATEGORIES = ['SOFTWARE', 'HARDWARE', 'TRAVEL', 'HOSTING', 'DESIGN', 'MARKETING', 'OTHER']

interface Expense {
  id: string
  date: string
  amount: string
  description: string
  category: string
  billable: boolean
  project: { id: string; name: string; client: { name: string } }
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [projects, setProjects] = useState<{ id: string; name: string; client: { name: string } }[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    projectId: '', date: new Date().toISOString().split('T')[0],
    amount: '', description: '', category: 'SOFTWARE', billable: true,
  })

  useEffect(() => {
    fetch('/api/expenses').then(r => r.json()).then(setExpenses)
    fetch('/api/projects').then(r => r.json()).then(setProjects)
  }, [])

  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const billableTotal = expenses.filter(e => e.billable).reduce((sum, e) => sum + Number(e.amount), 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const expense = await res.json()
      setExpenses(prev => [expense, ...prev])
      setForm({ projectId: '', date: new Date().toISOString().split('T')[0], amount: '', description: '', category: 'SOFTWARE', billable: true })
      setShowForm(false)
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8f0]">Expenses</h1>
          <p className="text-[#6b6b8a] text-sm mt-1">{formatCurrency(total)} total · {formatCurrency(billableTotal)} billable</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus size={14} /> Add Expense</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 mb-6 flex flex-col gap-4">
          <h2 className="font-semibold text-[#e8e8f0]">Add Expense</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#e8e8f0] font-medium">Project *</label>
              <select value={form.projectId} onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))} required
                className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff]">
                <option value="">Select project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.client.name} — {p.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#e8e8f0] font-medium">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} required
                className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#e8e8f0] font-medium">Amount (AUD) *</label>
              <input type="number" placeholder="99.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required min="0" step="0.01"
                className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff] placeholder:text-[#6b6b8a]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#e8e8f0] font-medium">Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff]">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#e8e8f0] font-medium">Billable</label>
              <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                <input type="checkbox" checked={form.billable} onChange={e => setForm(f => ({ ...f, billable: e.target.checked }))} className="w-4 h-4 accent-[#6c63ff]" />
                <span className="text-sm text-[#6b6b8a]">Billable to client</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-[#e8e8f0] font-medium">Description *</label>
            <input type="text" placeholder="What was this expense for?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required
              className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff] placeholder:text-[#6b6b8a]" />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading} size="sm">{loading ? 'Saving...' : 'Add Expense'}</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Date</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Project</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Description</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Category</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Amount</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Billable</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-[#6b6b8a] text-sm">No expenses yet</td></tr>
            )}
            {expenses.map(exp => (
              <tr key={exp.id} className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1a1a24] transition-colors">
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{formatDate(exp.date)}</td>
                <td className="px-6 py-4">
                  <p className="text-sm text-[#e8e8f0]">{exp.project.name}</p>
                  <p className="text-xs text-[#6b6b8a]">{exp.project.client.name}</p>
                </td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{exp.description}</td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{exp.category}</td>
                <td className="px-6 py-4 text-sm font-medium text-[#e8e8f0]">{formatCurrency(Number(exp.amount))}</td>
                <td className="px-6 py-4">
                  <Badge status={exp.billable ? 'ACTIVE' : 'CANCELLED'} label={exp.billable ? 'Yes' : 'No'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
