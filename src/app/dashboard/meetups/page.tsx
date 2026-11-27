export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { MEETUP_ZONES } from '@/components/booking/zones'
import { listGroupPolls, ownerWhen } from '@/lib/services/group-poll'
import { NewPollForm } from '@/components/dashboard/meetups/NewPollForm'
import { PANEL, SECTION_LABEL } from '@/components/dashboard/bookings/styles'

export default async function MeetupsPage() {
  const polls = await listGroupPolls()

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#e8e8f0]">Meetups</h1>
        <p className="mt-1 text-sm text-[#c8c8d8]">
          Find a time that works for a group. Offer a few times, share the link in the group chat, and pick the one most people can make.
        </p>
      </div>

      <section aria-labelledby="polls-heading" className="mb-10">
        <h2 id="polls-heading" className={`${SECTION_LABEL} mb-4`}>Polls</h2>
        <div className={`${PANEL} overflow-hidden`}>
          {polls.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-[#c8c8d8]">No polls yet. Make one below.</p>
          ) : (
            <ul className="divide-y divide-[#1e1e2e]">
              {polls.map(p => (
                <li key={p.id}>
                  <Link href={`/dashboard/meetups/${p.id}`} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 hover:bg-[#1a1a24]">
                    <div>
                      <p className="font-medium text-[#e8e8f0]">{p.title}</p>
                      <p className="text-sm text-[#c8c8d8]">
                        {p.optionCount} times · {p.responseCount} {p.responseCount === 1 ? 'answer' : 'answers'}
                        {p.closed && ' · closed'}
                      </p>
                    </div>
                    <p className="text-sm text-[#c8c8d8] tabular-nums">
                      {p.chosenStartsAt
                        ? <>Settled: <span className="text-[#3ecf8e]">{ownerWhen(p.chosenStartsAt, p.timezone)}</span></>
                        : p.bestStartsAt
                          ? <>Best so far: {ownerWhen(p.bestStartsAt, p.timezone)}</>
                          : 'Waiting for answers'}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section aria-labelledby="new-heading">
        <h2 id="new-heading" className={`${SECTION_LABEL} mb-4`}>New poll</h2>
        <div className={`${PANEL} p-6`}>
          <NewPollForm defaultZone={MEETUP_ZONES[0]} />
        </div>
      </section>
    </div>
  )
}
