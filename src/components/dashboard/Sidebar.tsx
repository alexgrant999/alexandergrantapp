'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, FolderOpen, FileText, Clock, Receipt, BarChart3, LogOut, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/clients', label: 'Clients', icon: Users },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderOpen },
  { href: '/dashboard/invoices', label: 'Invoices', icon: FileText },
  { href: '/dashboard/time', label: 'Time', icon: Clock },
  { href: '/dashboard/expenses', label: 'Expenses', icon: Receipt },
  { href: '/dashboard/subscriptions', label: 'Subscriptions', icon: RefreshCw },
  { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  return (
    <aside className="w-60 min-h-screen bg-[#13131a] border-r border-[#1e1e2e] flex flex-col shrink-0">
      <div className="p-6 border-b border-[#1e1e2e]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#ff6584] flex items-center justify-center text-white font-bold text-sm shrink-0">
            AG
          </div>
          <div>
            <p className="text-sm font-semibold text-[#e8e8f0]">Alexander Grant</p>
            <p className="text-xs text-[#6b6b8a]">Business</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-[#6c63ff]/10 text-[#6c63ff] font-medium'
                  : 'text-[#6b6b8a] hover:text-[#e8e8f0] hover:bg-[#1e1e2e]'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#1e1e2e]">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#6b6b8a] hover:text-[#e8e8f0] hover:bg-[#1e1e2e] transition-colors w-full"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
