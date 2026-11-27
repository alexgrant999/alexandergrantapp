import { getPublicPoll, pollIcs } from '@/lib/services/group-poll'

export const dynamic = 'force-dynamic'

/** The decided time as a calendar file. 404 until Alex has picked one. */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const poll = await getPublicPoll(slug)
  const ics = poll ? pollIcs(poll) : null
  if (!poll || !ics) return new Response('Not found', { status: 404 })
  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${poll.slug}.ics"`,
      'Cache-Control': 'no-store',
    },
  })
}
