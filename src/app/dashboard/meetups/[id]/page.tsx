export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink } from 'lucide-react'
import { getDashboardPoll } from '@/lib/services/group-poll'
import { zoneCity } from '@/components/booking/format'
import { PollManager } from '@/components/dashboard/meetups/PollManager'

export default async function MeetupPollPage({ params }: { params: Promise<{ id: string }> }) {
  const poll = await getDashboardPoll((await params).id)
  if (!poll) notFound()

  return (
    <div className="p-8">
      <Link href="/dashboard/meetups" className="text-sm text-[#8b85ff] underline-offset-4 hover:underline">All meetups</Link>
      <div className="mb-8 mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#e8e8f0]">{poll.title}</h1>
          <p className="mt-1 text-sm text-[#c8c8d8]">
            {poll.responses.length} {poll.responses.length === 1 ? 'answer' : 'answers'} · times shown in {zoneCity(poll.timezone)} time
            {poll.closed && ' · closed to new answers'}
          </p>
        </div>
        <a href={`/meet/${poll.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#8b85ff] underline-offset-4 hover:underline">
          Open the poll page <ExternalLink size={14} aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
      <PollManager poll={poll} />
    </div>
  )
}
