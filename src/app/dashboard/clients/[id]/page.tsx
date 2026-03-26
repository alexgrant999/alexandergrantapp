import { getClient } from '@/lib/services/clients'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Mail, Phone, MapPin, Plus, Pencil } from 'lucide-react'

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await getClient(id)
  if (!client) notFound()

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/dashboard/clients" className="text-sm text-[#6b6b8a] hover:text-[#e8e8f0] mb-4 inline-block transition-colors">← Clients</Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#e8e8f0]">{client.name}</h1>
            {client.company && <p className="text-[#6b6b8a] mt-1">{client.company}</p>}
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/clients/${client.id}/edit`}>
              <Button size="sm" variant="ghost"><Pencil size={12} /> Edit</Button>
            </Link>
            <Link href={`/dashboard/invoices/new?clientId=${client.id}`}>
              <Button size="sm"><Plus size={12} /> New Invoice</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6 col-span-1">
          <h2 className="font-semibold text-[#e8e8f0] mb-4">Contact</h2>
          <div className="flex flex-col gap-3">
            <a href={`mailto:${client.email}`} className="flex items-center gap-2.5 text-sm text-[#6b6b8a] hover:text-[#6c63ff] transition-colors">
              <Mail size={14} />{client.email}
            </a>
            {client.phone && (
              <span className="flex items-center gap-2.5 text-sm text-[#6b6b8a]">
                <Phone size={14} />{client.phone}
              </span>
            )}
            {client.address && (
              <span className="flex items-center gap-2.5 text-sm text-[#6b6b8a]">
                <MapPin size={14} />{client.address}
              </span>
            )}
          </div>
          {client.notes && (
            <div className="mt-4 pt-4 border-t border-[#1e1e2e]">
              <p className="text-xs text-[#6b6b8a] uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-[#6b6b8a]">{client.notes}</p>
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-[#1e1e2e]">
            <p className="text-xs text-[#6b6b8a] uppercase tracking-wider mb-2">Portal</p>
            <p className="text-xs text-[#6b6b8a] font-mono break-all">/portal/{client.portalToken}</p>
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-6">
          <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#e8e8f0]">Projects</h2>
              <Link href={`/dashboard/projects/new?clientId=${client.id}`}>
                <Button size="sm" variant="ghost"><Plus size={12} /> Add</Button>
              </Link>
            </div>
            {client.projects.length === 0 ? (
              <p className="text-sm text-[#6b6b8a]">No projects yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {client.projects.map(proj => (
                  <Link key={proj.id} href={`/dashboard/projects/${proj.id}`}
                    className="flex items-center justify-between py-2 border-b border-[#1e1e2e] last:border-0 hover:opacity-80 transition-opacity">
                    <p className="text-sm text-[#e8e8f0]">{proj.name}</p>
                    <Badge status={proj.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
            <h2 className="font-semibold text-[#e8e8f0] mb-4">Invoices</h2>
            {client.invoices.length === 0 ? (
              <p className="text-sm text-[#6b6b8a]">No invoices yet</p>
            ) : (
              <div className="flex flex-col gap-2">
                {client.invoices.map(inv => (
                  <Link key={inv.id} href={`/dashboard/invoices/${inv.id}`}
                    className="flex items-center justify-between py-2 border-b border-[#1e1e2e] last:border-0 hover:opacity-80 transition-opacity">
                    <div>
                      <p className="text-sm font-medium text-[#e8e8f0]">{inv.number}</p>
                      <p className="text-xs text-[#6b6b8a]">Due {formatDate(inv.dueDate)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[#e8e8f0]">{formatCurrency(Number(inv.total))}</span>
                      <Badge status={inv.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
