import { getClients } from '@/lib/services/clients'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Mail } from 'lucide-react'

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8f0]">Clients</h1>
          <p className="text-[#6b6b8a] text-sm mt-1">{clients.length} total</p>
        </div>
        <Link href="/dashboard/clients/new">
          <Button><Plus size={14} /> New Client</Button>
        </Link>
      </div>

      <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Client</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Email</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Projects</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Invoices</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Since</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[#6b6b8a] text-sm">
                  No clients yet. <Link href="/dashboard/clients/new" className="text-[#6c63ff] hover:underline">Add one</Link>
                </td>
              </tr>
            )}
            {clients.map(client => (
              <tr key={client.id} className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1a1a24] transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/dashboard/clients/${client.id}`}>
                    <p className="text-sm font-medium text-[#e8e8f0] hover:text-[#6c63ff] transition-colors">{client.name}</p>
                    {client.company && <p className="text-xs text-[#6b6b8a]">{client.company}</p>}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <a href={`mailto:${client.email}`} className="text-sm text-[#6b6b8a] flex items-center gap-1.5 hover:text-[#6c63ff] transition-colors w-fit">
                    <Mail size={12} />{client.email}
                  </a>
                </td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{client._count.projects}</td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{client._count.invoices}</td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{formatDate(client.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
