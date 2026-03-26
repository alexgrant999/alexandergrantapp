import { getSubscriptions } from '@/lib/services/subscriptions'
import { getClients } from '@/lib/services/clients'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { NewSubscriptionForm } from './NewSubscriptionForm'
import Link from 'next/link'

export default async function SubscriptionsPage() {
  const [subs, clients] = await Promise.all([getSubscriptions(), getClients()])

  const active = subs.filter(s => s.status === 'ACTIVE' && !s.cancelAtPeriodEnd)
  const mrr = active
    .reduce((sum, s) => {
      const amt = Number(s.amount)
      if (s.interval === 'MONTHLY') return sum + amt
      if (s.interval === 'QUARTERLY') return sum + amt / 3
      if (s.interval === 'ANNUALLY') return sum + amt / 12
      return sum
    }, 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8f0]">Subscriptions</h1>
          <p className="text-[#6b6b8a] text-sm mt-1">
            {active.length} active · {formatCurrency(mrr)}/mo MRR
          </p>
        </div>
        <NewSubscriptionForm clients={clients} />
      </div>

      <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Name</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Client</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Amount</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Interval</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Renews</th>
            </tr>
          </thead>
          <tbody>
            {subs.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[#6b6b8a] text-sm">
                  No subscriptions yet.
                </td>
              </tr>
            )}
            {subs.map(sub => (
              <tr key={sub.id} className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1a1a24] transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/dashboard/subscriptions/${sub.id}`} className="text-sm font-medium text-[#e8e8f0] hover:text-[#6c63ff] transition-colors">{sub.name}</Link>
                  {sub.cancelAtPeriodEnd && (
                    <p className="text-xs text-orange-400 mt-0.5">Cancels at period end</p>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{sub.client.name}</td>
                <td className="px-6 py-4 text-sm font-medium text-[#e8e8f0]">{formatCurrency(Number(sub.amount))}</td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a] capitalize">{sub.interval.toLowerCase()}</td>
                <td className="px-6 py-4">
                  <Badge status={sub.cancelAtPeriodEnd ? 'ON_HOLD' : sub.status} label={sub.cancelAtPeriodEnd ? 'Cancelling' : undefined} />
                </td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">
                  {sub.currentPeriodEnd ? formatDate(sub.currentPeriodEnd) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
