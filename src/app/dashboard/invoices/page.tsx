import { getInvoices } from '@/lib/services/invoices'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8f0]">Invoices</h1>
          <p className="text-[#6b6b8a] text-sm mt-1">{invoices.length} total</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button><Plus size={14} /> New Invoice</Button>
        </Link>
      </div>

      <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Invoice</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Client</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Amount</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Due</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[#6b6b8a] text-sm">
                  No invoices yet. <Link href="/dashboard/invoices/new" className="text-[#6c63ff] hover:underline">Create one</Link>
                </td>
              </tr>
            )}
            {invoices.map(inv => (
              <tr key={inv.id} className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1a1a24] transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/dashboard/invoices/${inv.id}`}>
                    <p className="text-sm font-medium text-[#e8e8f0] hover:text-[#6c63ff] transition-colors">{inv.number}</p>
                    <p className="text-xs text-[#6b6b8a]">{formatDate(inv.issueDate)}</p>
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{inv.client.name}</td>
                <td className="px-6 py-4"><Badge status={inv.status} /></td>
                <td className="px-6 py-4 text-sm font-medium text-[#e8e8f0]">{formatCurrency(Number(inv.total))}</td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{formatDate(inv.dueDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
