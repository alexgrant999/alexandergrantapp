'use client'
import Image from 'next/image'
import { useEffect, useState, type KeyboardEvent } from 'react'
import { Ledger } from '@/components/Ledger'

export type ClientTab = { id: string; name: string; image: string; alt: string; improved: string; rows: string[][] }

const INTERVAL_MS = 7000

// The hero ledger turns through one client at a time. It pauses while the reader is on it and stops entirely under reduced motion.
export function HeroLedger({ tabs }: { tabs: ClientTab[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [still, setStill] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setStill(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (paused || still) return
    const t = setInterval(() => setIndex(i => (i + 1) % tabs.length), INTERVAL_MS)
    return () => clearInterval(t)
  }, [paused, still, tabs.length, index])

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = e.key === 'ArrowRight' ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length
    setIndex(next)
    document.getElementById(`hl-tab-${tabs[next].id}`)?.focus()
  }

  const tab = tabs[index]
  return (
    <div className={paused || still ? 'hl hl-paused' : 'hl'} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <p className="hl-caption">From recent client reports</p>
      <div role="tablist" aria-label="Clients" className="hl-tabs" onKeyDown={onKey}>
        {tabs.map((t, n) => (
          <button key={t.id} type="button" role="tab" id={`hl-tab-${t.id}`} aria-selected={n === index} aria-controls={`hl-panel-${t.id}`} tabIndex={n === index ? 0 : -1} className="hl-tab" onClick={() => setIndex(n)}>
            {t.name}
          </button>
        ))}
      </div>
      <div key={tab.id} role="tabpanel" id={`hl-panel-${tab.id}`} aria-labelledby={`hl-tab-${tab.id}`} className="hl-panel">
        <Image className="hl-image" src={tab.image} width={1280} height={800} alt={tab.alt} sizes="(max-width: 560px) 100vw, 220px" priority={index === 0} />
        <div>
          <p className="hl-improved">{tab.improved}</p>
          <Ledger rows={tab.rows} plain />
        </div>
      </div>
    </div>
  )
}
