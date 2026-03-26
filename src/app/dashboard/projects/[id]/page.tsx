import { getProject } from '@/lib/services/projects'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Plus } from 'lucide-react'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = await getProject(id)
  if (!project) notFound()

  const totalHours = project.timeEntries.reduce((sum, te) => sum + Number(te.hours), 0)
  const totalExpenses = project.expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/dashboard/projects" className="text-sm text-[#6b6b8a] hover:text-[#e8e8f0] mb-4 inline-block transition-colors">← Projects</Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#e8e8f0]">{project.name}</h1>
            <p className="text-[#6b6b8a] mt-1">{project.client.name}</p>
            {project.description && <p className="text-sm text-[#6b6b8a] mt-2">{project.description}</p>}
          </div>
          <Badge status={project.status} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-5">
          <p className="text-xs text-[#6b6b8a] uppercase tracking-wider mb-1">Budget</p>
          <p className="text-xl font-bold text-[#e8e8f0]">{project.budget ? formatCurrency(Number(project.budget)) : '—'}</p>
        </div>
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-5">
          <p className="text-xs text-[#6b6b8a] uppercase tracking-wider mb-1">Hours Logged</p>
          <p className="text-xl font-bold text-[#e8e8f0]">{totalHours}h</p>
        </div>
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-5">
          <p className="text-xs text-[#6b6b8a] uppercase tracking-wider mb-1">Expenses</p>
          <p className="text-xl font-bold text-[#e8e8f0]">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#e8e8f0]">Time Entries</h2>
            <Link href={`/dashboard/time?projectId=${project.id}`}>
              <Button size="sm" variant="ghost"><Plus size={12} /> Log Time</Button>
            </Link>
          </div>
          {project.timeEntries.length === 0 ? (
            <p className="text-sm text-[#6b6b8a]">No time logged yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {project.timeEntries.slice(0, 10).map(te => (
                <div key={te.id} className="flex justify-between py-2 border-b border-[#1e1e2e] last:border-0">
                  <div>
                    <p className="text-sm text-[#e8e8f0]">{te.description}</p>
                    <p className="text-xs text-[#6b6b8a]">{formatDate(te.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#e8e8f0]">{Number(te.hours)}h</p>
                    {te.billable && <p className="text-xs text-green-400">Billable</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#e8e8f0]">Expenses</h2>
            <Link href={`/dashboard/expenses?projectId=${project.id}`}>
              <Button size="sm" variant="ghost"><Plus size={12} /> Add</Button>
            </Link>
          </div>
          {project.expenses.length === 0 ? (
            <p className="text-sm text-[#6b6b8a]">No expenses yet</p>
          ) : (
            <div className="flex flex-col gap-2">
              {project.expenses.slice(0, 10).map(exp => (
                <div key={exp.id} className="flex justify-between py-2 border-b border-[#1e1e2e] last:border-0">
                  <div>
                    <p className="text-sm text-[#e8e8f0]">{exp.description}</p>
                    <p className="text-xs text-[#6b6b8a]">{exp.category} · {formatDate(exp.date)}</p>
                  </div>
                  <p className="text-sm font-medium text-[#e8e8f0]">{formatCurrency(Number(exp.amount))}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
