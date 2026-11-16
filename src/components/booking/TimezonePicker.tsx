'use client'
import { useRouter } from 'next/navigation'
import { useId, useRef, useState, useSyncExternalStore } from 'react'
import { zoneCity } from './format'
import { COMMON_ZONES, ZONE_REGIONS, placeLabel } from './zones'

type Option = { value: string; label: string }
type Lists = { common: Option[]; regions: { label: string; options: Option[] }[] }

function offsetLabel(zone: string, now: Date): string {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset' }).formatToParts(now).find(p => p.type === 'timeZoneName')
    const offset = (part?.value ?? '').replace('GMT', 'UTC')
    return offset ? `${placeLabel(zone)} (${offset})` : placeLabel(zone)
  } catch {
    return placeLabel(zone)
  }
}

function buildLists(): Lists {
  const now = new Date()
  let detected = ''
  try {
    detected = Intl.DateTimeFormat().resolvedOptions().timeZone ?? ''
  } catch {
    detected = ''
  }
  const top = [...(detected ? [detected] : []), ...COMMON_ZONES.filter(z => z !== detected)]
  const option = (zone: string): Option => ({ value: zone, label: offsetLabel(zone, now) })
  return {
    common: top.map(option),
    regions: ZONE_REGIONS
      .map(r => ({ label: r.label, options: r.places.filter(p => !top.includes(p.zone)).map(p => option(p.zone)) }))
      .filter(r => r.options.length > 0),
  }
}

// The lists depend on the browser's own clock, so they are built after hydration only.
let cached: Lists | null = null
const subscribe = () => () => {}
const clientSnapshot = () => (cached ??= buildLists())
const serverSnapshot = () => null

/**
 * "Times in Sydney time" with a Change control. Choosing a place swaps ?tz= and keeps
 * every other part of the query, so the lists redraw on that clock. router.replace,
 * so Back is not filled with zone changes.
 */
export function TimezonePicker({ current }: { current: string }) {
  const router = useRouter()
  const lists = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot)
  const selectId = useId()
  const [open, setOpen] = useState(false)
  const changeRef = useRef<HTMLButtonElement>(null)

  function choose(zone: string) {
    const url = new URL(window.location.href)
    url.searchParams.set('tz', zone)
    router.replace(`${url.pathname}${url.search}`, { scroll: false })
    setOpen(false)
    changeRef.current?.focus()
  }

  const known = lists ? [...lists.common, ...lists.regions.flatMap(r => r.options)].some(o => o.value === current) : false

  return (
    <div>
      <p className="bk-zone">
        <span>Times in {zoneCity(current)} time.</span>
        <button ref={changeRef} type="button" className="bk-linkbutton" aria-expanded={open} aria-controls={open ? selectId : undefined} onClick={() => setOpen(v => !v)}>
          Change<span className="sr-only"> the time zone</span>
        </button>
      </p>
      {open && (
        <div className="bk-zone-pick">
          <label className="bk-label" htmlFor={selectId}>Show times for</label>
          <select id={selectId} className="bk-select" value={current} onChange={e => choose(e.target.value)}>
            {(!lists || !known) && <option value={current}>{zoneCity(current)}</option>}
            {lists && (
              <>
                <optgroup label="Common places">
                  {lists.common.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </optgroup>
                {lists.regions.map(r => (
                  <optgroup key={r.label} label={r.label}>
                    {r.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </optgroup>
                ))}
              </>
            )}
          </select>
        </div>
      )}
    </div>
  )
}
