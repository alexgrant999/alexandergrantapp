export const dynamic = 'force-dynamic'
import { getInvoices } from '@/lib/services/invoices'
import { getProjects } from '@/lib/services/projects'
import { getTimeEntries } from '@/lib/services/time'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { DollarSign, AlertCircle, FolderOpen, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const [invoices, projects, timeEntries] = await Promise.all([
    getInvoices(),
    getProjects(),
    getTimeEntries(),
  ])

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())

  const monthRevenue = invoices
    .filter(inv => inv.status === 'PAID' && inv.paidAt && new Date(inv.paidAt) >= startOfMonth)
    .reduce((sum, inv) => sum + Number(inv.total), 0)

  const outstanding = invoices
    .filter(inv => inv.status === 'SENT' || inv.status === 'OVERDUE')
    .reduce((sum, inv) => sum + Number(inv.total), 0)

  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length

  const weekHours = timeEntries
    .filter(te => new Date(te.date) >= startOfWeek)
    .reduce((sum, te) => sum + Number(te.hours), 0)

  const recentInvoices = invoices.slice(0, 5)
  const activeProjectList = projects.filter(p => p.status === 'ACTIVE').slice(0, 5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#e8e8f0]">Overview</h1>
        <p className="text-[#6b6b8a] text-sm mt-1">Welcome back, Alex</p>
      </div>

      <div className="grid grid-cols-4 gap-5 mb-8">
        <StatsCard label="Revenue this month" value={formatCurrency(monthRevenue)} icon={DollarSign} />
        <StatsCard
          label="Outstanding"
          value={formatCurrency(outstanding)}
          icon={AlertCircle}
          trend={`${invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').length} invoices`}
        />
        <StatsCard label="Active projects" value={String(activeProjects)} icon={FolderOpen} />
        <StatsCard label="Hours this week" value={`${weekHours}h`} icon={Clock} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[#e8e8f0]">Recent Invoices</h2>
            <Link href="/dashboard/invoices" className="text-xs text-[#6c63ff] hover:underline">View all</Link>
          </div>
          <div className="flex flex-col gap-1">
            {recentInvoices.length === 0 && <p className="text-sm text-[#6b6b8a] py-4">No invoices yet</p>}
            {recentInvoices.map(inv => (
              <Link
                key={inv.id}
                href={`/dashboard/invoices/${inv.id}`}
                className="flex items-center justify-between py-3 border-b border-[#1e1e2e] last:border-0 hover:opacity-80 transition-opacity"
              >
                <div>
                  <p className="text-sm font-medium text-[#e8e8f0]">{inv.number}</p>
                  <p className="text-xs text-[#6b6b8a]">{inv.client.name} · Due {formatDate(inv.dueDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#e8e8f0]">{formatCurrency(Number(inv.total))}</span>
                  <Badge status={inv.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[#e8e8f0]">Active Projects</h2>
            <Link href="/dashboard/projects" className="text-xs text-[#6c63ff] hover:underline">View all</Link>
          </div>
          <div className="flex flex-col gap-1">
            {activeProjectList.length === 0 && <p className="text-sm text-[#6b6b8a] py-4">No active projects</p>}
            {activeProjectList.map(proj => (
              <Link
                key={proj.id}
                href={`/dashboard/projects/${proj.id}`}
                className="flex items-center justify-between py-3 border-b border-[#1e1e2e] last:border-0 hover:opacity-80 transition-opacity"
              >
                <div>
                  <p className="text-sm font-medium text-[#e8e8f0]">{proj.name}</p>
                  <p className="text-xs text-[#6b6b8a]">{proj.client.name}</p>
                </div>
                <Badge status={proj.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
