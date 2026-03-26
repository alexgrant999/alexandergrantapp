export const dynamic = 'force-dynamic'
import { getProjects } from '@/lib/services/projects'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8f0]">Projects</h1>
          <p className="text-[#6b6b8a] text-sm mt-1">{projects.length} total</p>
        </div>
        <Link href="/dashboard/projects/new">
          <Button><Plus size={14} /> New Project</Button>
        </Link>
      </div>

      <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Project</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Client</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Budget</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Started</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[#6b6b8a] text-sm">
                  No projects yet
                </td>
              </tr>
            )}
            {projects.map(proj => (
              <tr key={proj.id} className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1a1a24] transition-colors">
                <td className="px-6 py-4">
                  <Link href={`/dashboard/projects/${proj.id}`}>
                    <p className="text-sm font-medium text-[#e8e8f0] hover:text-[#6c63ff] transition-colors">{proj.name}</p>
                    {proj.description && <p className="text-xs text-[#6b6b8a] mt-0.5 line-clamp-1">{proj.description}</p>}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{proj.client.name}</td>
                <td className="px-6 py-4"><Badge status={proj.status} /></td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{proj.budget ? formatCurrency(Number(proj.budget)) : '—'}</td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{proj.startDate ? formatDate(proj.startDate) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
