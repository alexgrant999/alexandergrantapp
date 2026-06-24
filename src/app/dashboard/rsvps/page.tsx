export const dynamic = 'force-dynamic'
import { listRsvps, rsvpCounts } from '@/lib/services/rsvp'
import { formatDate } from '@/lib/utils'
import { Check, X } from 'lucide-react'

export default async function RsvpsPage() {
  const [rsvps, counts] = await Promise.all([listRsvps(), rsvpCounts()])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8f0]">Birthday RSVPs</h1>
          <p className="text-[#6b6b8a] text-sm mt-1">Sat July 11 · East Hampton · {counts.total} replies · {counts.heads} guests expected</p>
        </div>
        <div className="flex gap-3">
          <Stat label="Coming" value={counts.yes} tone="#1f9d63" />
          <Stat label="Can’t make it" value={counts.no} tone="#b04a4a" />
        </div>
      </div>

      <div className="bg-[#16161f] border border-[#1e1e2e] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1e1e2e]">
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Guest</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Reply</th>
              <th className="text-left px-6 py-4 text-xs font-medium text-[#6b6b8a] uppercase tracking-wider">Received</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-12 text-[#6b6b8a] text-sm">
                  No RSVPs yet. Share <span className="text-[#e8e8f0]">/birthday</span> to start collecting replies.
                </td>
              </tr>
            )}
            {rsvps.map(r => (
              <tr key={r.id} className="border-b border-[#1e1e2e] last:border-0 hover:bg-[#1a1a24] transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-[#e8e8f0]">{r.name}</td>
                <td className="px-6 py-4">
                  {r.attending ? (
                    <span className="inline-flex items-center gap-2 text-sm text-[#3ecf8e]">
                      <span className="inline-flex items-center gap-1.5"><Check size={14} /> Coming</span>
                      {r.plusOne && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#d9b87a]/15 text-[#d9b87a] border border-[#d9b87a]/30">+1</span>
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-[#e07a7a]">
                      <X size={14} /> Can’t make it
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-[#6b6b8a]">{formatDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
