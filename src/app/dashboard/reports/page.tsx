'use client'
import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'

interface Invoice {
  id: string
  status: string
  total: string
  paidAt: string | null
  issueDate: string
  client: { name: string }
}

interface TimeEntry { hours: string; billable: boolean }

export default function ReportsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])

  useEffect(() => {
    fetch('/api/invoices').then(r => r.json()).then(setInvoices).catch(() => setInvoices([]))
    fetch('/api/time').then(r => r.json()).then(setTimeEntries).catch(() => setTimeEntries([]))
  }, [])

  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(now, 5 - i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const revenue = invoices
      .filter(inv => inv.status === 'PAID' && inv.paidAt && new Date(inv.paidAt) >= start && new Date(inv.paidAt) <= end)
      .reduce((sum, inv) => sum + Number(inv.total), 0)
    return { month: format(date, 'MMM'), revenue }
  })

  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + Number(i.total), 0)
  const totalOutstanding = invoices.filter(i => i.status === 'SENT' || i.status === 'OVERDUE').reduce((sum, i) => sum + Number(i.total), 0)
  const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.total), 0)

  const totalHours = timeEntries.reduce((sum, te) => sum + Number(te.hours), 0)
  const billableHours = timeEntries.filter(te => te.billable).reduce((sum, te) => sum + Number(te.hours), 0)
  const billablePct = totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0

  const pieData = [
    { name: 'Collected', value: totalRevenue, color: '#6c63ff' },
    { name: 'Outstanding', value: totalOutstanding, color: '#ff6584' },
  ]

  const clientRevenue: Record<string, number> = {}
  invoices.filter(i => i.status === 'PAID').forEach(inv => {
    clientRevenue[inv.client.name] = (clientRevenue[inv.client.name] || 0) + Number(inv.total)
  })
  const topClients = Object.entries(clientRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#e8e8f0]">Reports</h1>
        <p className="text-[#6b6b8a] text-sm mt-1">Financial overview</p>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
          <p className="text-xs text-[#6b6b8a] uppercase tracking-wider mb-1">Total Invoiced</p>
          <p className="text-2xl font-bold text-[#e8e8f0]">{formatCurrency(totalInvoiced)}</p>
        </div>
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
          <p className="text-xs text-[#6b6b8a] uppercase tracking-wider mb-1">Collected</p>
          <p className="text-2xl font-bold text-[#6c63ff]">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
          <p className="text-xs text-[#6b6b8a] uppercase tracking-wider mb-1">Outstanding</p>
          <p className="text-2xl font-bold text-[#ff6584]">{formatCurrency(totalOutstanding)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
          <h2 className="font-semibold text-[#e8e8f0] mb-6">Revenue (Last 6 Months)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={months}>
              <XAxis dataKey="month" tick={{ fill: '#6b6b8a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b6b8a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#16161f', border: '1px solid #1e1e2e', borderRadius: 8, color: '#e8e8f0' }}
                formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#6c63ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
          <h2 className="font-semibold text-[#e8e8f0] mb-6">Collected vs Outstanding</h2>
          {totalInvoiced > 0 ? (
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {pieData.map(entry => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: entry.color }} />
                    <div>
                      <p className="text-xs text-[#6b6b8a]">{entry.name}</p>
                      <p className="text-sm font-medium text-[#e8e8f0]">{formatCurrency(entry.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[#6b6b8a] mt-4">No invoice data yet</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
          <h2 className="font-semibold text-[#e8e8f0] mb-4">Time Summary</h2>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between">
              <p className="text-sm text-[#6b6b8a]">Total hours logged</p>
              <p className="text-sm font-medium text-[#e8e8f0]">{totalHours}h</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-[#6b6b8a]">Billable hours</p>
              <p className="text-sm font-medium text-[#e8e8f0]">{billableHours}h</p>
            </div>
            <div className="flex justify-between">
              <p className="text-sm text-[#6b6b8a]">Billable %</p>
              <p className="text-sm font-medium text-[#6c63ff]">{billablePct}%</p>
            </div>
            <div className="w-full bg-[#1e1e2e] rounded-full h-2 mt-2">
              <div className="bg-[#6c63ff] h-2 rounded-full transition-all" style={{ width: `${billablePct}%` }} />
            </div>
          </div>
        </div>

        <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl p-6">
          <h2 className="font-semibold text-[#e8e8f0] mb-4">Top Clients by Revenue</h2>
          {topClients.length === 0 ? (
            <p className="text-sm text-[#6b6b8a]">No data yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {topClients.map(([name, revenue]) => (
                <div key={name} className="flex justify-between items-center py-2 border-b border-[#1e1e2e] last:border-0">
                  <p className="text-sm text-[#e8e8f0]">{name}</p>
                  <p className="text-sm font-medium text-[#6c63ff]">{formatCurrency(revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
