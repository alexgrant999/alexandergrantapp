import { cn } from '@/lib/utils'

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6', className)}>
      {children}
    </div>
  )
}
