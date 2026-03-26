import { type LucideIcon } from 'lucide-react'

export function StatsCard({ label, value, icon: Icon, trend }: {
  label: string
  value: string
  icon: LucideIcon
  trend?: string
}) {
  return (
    <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-[#6b6b8a]">{label}</p>
        <div className="w-9 h-9 rounded-lg bg-[#6c63ff]/10 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-[#6c63ff]" />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#e8e8f0]">{value}</p>
      {trend && <p className="text-xs text-[#6b6b8a] mt-1">{trend}</p>}
    </div>
  )
}
