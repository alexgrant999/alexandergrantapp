'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

function NewProjectForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultClientId = searchParams.get('clientId') ?? ''
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(setClients)
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd.entries())
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) router.push('/dashboard/projects')
    else setLoading(false)
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/dashboard/projects" className="text-sm text-[#6b6b8a] hover:text-[#e8e8f0] mb-4 inline-block transition-colors">← Back</Link>
        <h1 className="text-2xl font-bold text-[#e8e8f0]">New Project</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-[#e8e8f0] font-medium">Client *</label>
          <select
            name="clientId"
            defaultValue={defaultClientId}
            required
            className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff]"
          >
            <option value="">Select a client</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <Input label="Project Name *" name="name" placeholder="Website Redesign" required />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-[#e8e8f0] font-medium">Description</label>
          <textarea
            name="description"
            rows={3}
            placeholder="What is this project about?"
            className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff] resize-none placeholder:text-[#6b6b8a]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Budget (AUD)" name="budget" type="number" placeholder="5000" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm text-[#e8e8f0] font-medium">Status</label>
            <select
              name="status"
              defaultValue="ACTIVE"
              className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff]"
            >
              <option value="ACTIVE">Active</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Start Date" name="startDate" type="date" />
          <Input label="End Date" name="endDate" type="date" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Create Project'}</Button>
          <Link href="/dashboard/projects"><Button type="button" variant="ghost">Cancel</Button></Link>
        </div>
      </form>
    </div>
  )
}

export default function NewProjectPage() {
  return (
    <Suspense>
      <NewProjectForm />
    </Suspense>
  )
}
