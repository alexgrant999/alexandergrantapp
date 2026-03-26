import { cn } from '@/lib/utils'

const variants: Record<string, string> = {
  ACTIVE: 'bg-green-500/10 text-green-400',
  ON_HOLD: 'bg-yellow-500/10 text-yellow-400',
  COMPLETED: 'bg-blue-500/10 text-blue-400',
  CANCELLED: 'bg-red-500/10 text-red-400',
  DRAFT: 'bg-[#1e1e2e] text-[#6b6b8a]',
  SENT: 'bg-blue-500/10 text-blue-400',
  PAID: 'bg-green-500/10 text-green-400',
  OVERDUE: 'bg-red-500/10 text-red-400',
  PAST_DUE: 'bg-orange-500/10 text-orange-400',
  PAUSED: 'bg-yellow-500/10 text-yellow-400',
  PENDING: 'bg-purple-500/10 text-purple-400',
}

export function Badge({ status, label }: { status?: string; label?: string }) {
  const text = label ?? status ?? ''
  const variant = variants[status ?? ''] ?? 'bg-[#1e1e2e] text-[#6b6b8a]'
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium', variant)}>
      {text}
    </span>
  )
}
