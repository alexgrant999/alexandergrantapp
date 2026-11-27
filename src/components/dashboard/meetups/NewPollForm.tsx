'use client'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { createPollAction } from '@/app/dashboard/meetups/actions'
import { ZONE_REGIONS } from '@/components/booking/zones'
import { INPUT, PRIMARY } from '@/components/dashboard/bookings/styles'
import { TimesEditor, type LocalTime } from './TimesEditor'

const DURATIONS = [30, 45, 60, 90, 120]

export function NewPollForm({ defaultZone }: { defaultZone: string }) {
  const router = useRouter()
  const [title, setTitle] = useState('Claude and Such: online meetup')
  const [note, setNote] = useState('')
  const [durationMinutes, setDuration] = useState(60)
  const [timezone, setTimezone] = useState(defaultZone)
  const [meetingUrl, setMeetingUrl] = useState('')
  const [times, setTimes] = useState<LocalTime[]>([{ date: '', time: '19:00' }, { date: '', time: '19:00' }])
  const [message, setMessage] = useState('')
  const [pending, startTransition] = useTransition()

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const filled = times.filter(t => t.date && t.time)
    if (filled.length < 2) return setMessage('Offer at least two times, each with a date.')
    setMessage('')
    startTransition(async () => {
      const result = await createPollAction({ title, note, durationMinutes, timezone, meetingUrl, times: filled })
      if (!result.ok || !result.id) return setMessage(result.error ?? 'That did not save. Try again.')
      router.push(`/dashboard/meetups/${result.id}`)
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-[#c8c8d8]">
          Name
          <input className={INPUT} value={title} onChange={e => setTitle(e.target.value)} maxLength={80} required />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-[#c8c8d8]">
          Video call link (optional, shown once a time is picked)
          <input className={INPUT} type="url" value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)} placeholder="https://meet.google.com/..." />
        </label>
      </div>
      <label className="flex flex-col gap-1.5 text-sm text-[#c8c8d8]">
        Note for the group (optional)
        <textarea className={`${INPUT} min-h-24 py-2`} value={note} onChange={e => setNote(e.target.value)} maxLength={600} placeholder="What we'll talk about, who to bring along." />
      </label>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-[#c8c8d8]">
          How long
          <select className={INPUT} value={durationMinutes} onChange={e => setDuration(Number(e.target.value))}>
            {DURATIONS.map(d => <option key={d} value={d}>{d < 60 ? `${d} minutes` : d === 60 ? '1 hour' : `${d / 60} hours`}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-[#c8c8d8]">
          The times below are in
          <select className={INPUT} value={timezone} onChange={e => setTimezone(e.target.value)}>
            {ZONE_REGIONS.map(r => (
              <optgroup key={r.label} label={r.label}>
                {r.places.map(p => <option key={p.zone} value={p.zone}>{p.label}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
      </div>
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm text-[#c8c8d8]">Times to offer. Everyone sees them on their own clock.</legend>
        <TimesEditor times={times} onChange={setTimes} disabled={pending} />
      </fieldset>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className={PRIMARY} disabled={pending}>{pending ? 'Creating…' : 'Create poll'}</button>
        <p role="status" className="text-sm text-[#e8e8f0]">{message}</p>
      </div>
    </form>
  )
}
