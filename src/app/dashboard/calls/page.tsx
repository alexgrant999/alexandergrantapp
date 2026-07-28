export const dynamic = 'force-dynamic'
import { listVoiceCalls, voiceCallCounts } from '@/lib/services/voice-calls'
import { formatDate } from '@/lib/utils'
import { Phone, MessageSquare } from 'lucide-react'

export default async function CallsPage() {
  const [calls, counts] = await Promise.all([listVoiceCalls(), voiceCallCounts()])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8f0]">Calls</h1>
          <p className="text-[#6b6b8a] text-sm mt-1">Inbound enquiries captured by the voice agent</p>
        </div>
        <div className="flex gap-3">
          <Stat label="Last 30 days" value={counts.last30} tone="#6c63ff" />
          <Stat label="Portfolio sent" value={counts.portfolio} tone="#3ecf8e" />
          <Stat label="All time" value={counts.total} tone="#d9b87a" />
        </div>
      </div>

      <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Caller</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Wants</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Timeline</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Length</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Received</th>
            </tr>
          </thead>
          <tbody>
            {calls.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-[#6b6b8a] text-sm">
                  No calls yet. Ring the agent number to test it.
                </td>
              </tr>
            )}
            {calls.map(c => (
              <tr key={c.id} className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1a1a24] transition-colors align-top">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#e8e8f0]">{c.callerName ?? 'Unknown'}</span>
                    {c.portfolioSent && (
                      <span title="Portfolio texted" className="text-[#3ecf8e]">
                        <MessageSquare size={13} />
                      </span>
                    )}
                  </div>
                  {c.business && <p className="text-xs text-[#6b6b8a] mt-0.5">{c.business}</p>}
                  {c.callerNumber && (
                    <p className="text-xs text-[#6b6b8a] mt-0.5 flex items-center gap-1">
                      <Phone size={11} /> {c.callerNumber}
                    </p>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-[#c8c8d8] max-w-md">
                  {c.interest ?? <span className="text-[#6b6b8a]">—</span>}
                  {c.budget && <p className="text-xs text-[#d9b87a] mt-1">Budget: {c.budget}</p>}
                </td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{c.timeline ?? '—'}</td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{c.durationSecs ? `${c.durationSecs}s` : '—'}</td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a] whitespace-nowrap">{formatDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {calls.some(c => c.summary) && (
        <div className="mt-8">
          <h2 className="text-sm font-medium text-[#6b6b8a] uppercase tracking-wider mb-4">Recent summaries</h2>
          <div className="flex flex-col gap-3">
            {calls
              .filter(c => c.summary)
              .slice(0, 10)
              .map(c => (
                <div key={c.id} className="bg-[#16161f] border border-[#1e1e2e] rounded-xl px-6 py-4">
                  <p className="text-sm font-medium text-[#e8e8f0]">
                    {c.callerName ?? 'Unknown'}
                    {c.business && <span className="text-[#6b6b8a] font-normal"> · {c.business}</span>}
                  </p>
                  <p className="text-sm text-[#c8c8d8] mt-2 leading-relaxed">{c.summary}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="bg-[#16161f] border border-[#1e1e2e] rounded-xl px-5 py-3 text-center min-w-[96px]">
      <p className="text-2xl font-bold" style={{ color: tone }}>{value}</p>
      <p className="text-xs text-[#6b6b8a] mt-0.5">{label}</p>
    </div>
  )
}
