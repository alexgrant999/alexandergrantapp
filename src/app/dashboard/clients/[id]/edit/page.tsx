'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { clientSchema } from '@/lib/validators/client'

export default function EditClientPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [client, setClient] = useState<Record<string, string>>({})

  useEffect(() => {
    fetch(`/api/clients/${id}`)
      .then(r => r.json())
      .then(data => {
        setClient({
          name: data.name ?? '',
          email: data.email ?? '',
          company: data.company ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          notes: data.notes ?? '',
        })
        setFetching(false)
      })
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    const fd = new FormData(e.currentTarget)
    const data = Object.fromEntries(fd.entries())
    const parsed = clientSchema.safeParse(data)
    if (!parsed.success) {
      const errs: Record<string, string> = {}
      parsed.error.issues.forEach(err => { errs[err.path[0] as string] = err.message })
      setErrors(errs)
      setLoading(false)
      return
    }
    const res = await fetch(`/api/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
    })
    if (res.ok) {
      router.push(`/dashboard/clients/${id}`)
    } else {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="p-8 text-[#6b6b8a]">Loading...</div>
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href={`/dashboard/clients/${id}`} className="text-sm text-[#6b6b8a] hover:text-[#e8e8f0] mb-4 inline-block transition-colors">← Back</Link>
        <h1 className="text-2xl font-bold text-[#e8e8f0]">Edit Client</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Name *" name="name" defaultValue={client.name} placeholder="Jane Smith" error={errors.name} />
          <Input label="Email *" name="email" type="email" defaultValue={client.email} placeholder="jane@example.com" error={errors.email} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Company" name="company" defaultValue={client.company} placeholder="Acme Corp" />
          <Input label="Phone" name="phone" defaultValue={client.phone} placeholder="+61 4xx xxx xxx" />
        </div>
        <Input label="Address" name="address" defaultValue={client.address} placeholder="123 Main St, Sydney NSW 2000" />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-[#e8e8f0] font-medium">Notes</label>
          <textarea
            name="notes"
            defaultValue={client.notes}
            placeholder="Any notes about this client..."
            rows={3}
            className="bg-[#13131a] border border-[#1e1e2e] text-[#e8e8f0] rounded-lg px-3.5 py-2.5 text-sm outline-none focus:border-[#6c63ff] resize-none placeholder:text-[#6b6b8a]"
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          <Link href={`/dashboard/clients/${id}`}><Button type="button" variant="ghost">Cancel</Button></Link>
        </div>
      </form>
    </div>
  )
}
