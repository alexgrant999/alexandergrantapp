'use client'
import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import { Plus } from 'lucide-react'

interface TimeEntry {
  id: string
  date: string
  hours: string
  description: string
  billable: boolean
  project: { id: string; name: string; client: { name: string } }
}

export default function TimePage() {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [projects, setProjects] = useState<{ id: string; name: string; client: { name: string } }[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    projectId: '', date: new Date().toISOString().split('T')[0],
    hours: '', description: '', billable: true, hourlyRate: '',
  })

  useEffect(() => {
    fetch('/api/time').then(r => r.json()).then(setEntries)
    fetch('/api/projects').then(r => r.json()).then(setProjects)
  }, [])

  const totalHours = entries.reduce((sum, e) => sum + Number(e.hours), 0)
  const billableHours = entries.filter(e => e.billable).reduce((sum, e) => sum + Number(e.hours), 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/time', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, billable: form.billable }),
    })
    if (res.ok) {
      const entry = await res.json()
      setEntries(prev => [entry, ...prev])
      setForm({ projectId: '', date: new Date().toISOString().split('T')[0], hours: '', description: '', billable: true, hourlyRate: '' })
      setShowForm(false)
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8f0]">Time Tracking</h1>
          <p className="text-[#6b6b8a] text-sm mt-1">{totalHours}h total · {billableHours}h billable</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus size={14} /> Log Time</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 mb-6 flex flex-col gap-4">
          <h2 className="font-semibold text-[#e8e8f0]">Log Time</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#e8e8f0] font-medium">Project *</label>
              <select
                value={form.projectId}
                onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
                required
                className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff]"
              >
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
              <label className="text-sm text-[#e8e8f0] font-medium">Hours *</label>
              <input type="number" placeholder="2.5" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} required min="0" step="0.25"
                className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff] placeholder:text-[#6b6b8a]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#e8e8f0] font-medium">Hourly Rate</label>
              <input type="number" placeholder="150" value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))} min="0"
                className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff] placeholder:text-[#6b6b8a]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm text-[#e8e8f0] font-medium">Billable</label>
              <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                <input type="checkbox" checked={form.billable} onChange={e => setForm(f => ({ ...f, billable: e.target.checked }))}
                  className="w-4 h-4 accent-[#6c63ff]" />
                <span className="text-sm text-[#6b6b8a]">Billable to client</span>
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-[#e8e8f0] font-medium">Description *</label>
            <input type="text" placeholder="What did you work on?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required
              className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff] placeholder:text-[#6b6b8a]" />
          </div>
          <div className="flex gap-3">
            <Button type="submit" disabled={loading} size="sm">{loading ? 'Saving...' : 'Log Time'}</Button>
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
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Hours</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Billable</th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-[#6b6b8a] text-sm">No time entries yet</td></tr>
            )}
            {entries.map(entry => (
              <tr key={entry.id} className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1a1a24] transition-colors">
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{formatDate(entry.date)}</td>
                <td className="px-6 py-4">
                  <p className="text-sm text-[#e8e8f0]">{entry.project.name}</p>
                  <p className="text-xs text-[#6b6b8a]">{entry.project.client.name}</p>
                </td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{entry.description}</td>
                <td className="px-6 py-4 text-sm font-medium text-[#e8e8f0]">{Number(entry.hours)}h</td>
                <td className="px-6 py-4">
                  <Badge status={entry.billable ? 'ACTIVE' : 'CANCELLED'} label={entry.billable ? 'Yes' : 'No'} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
