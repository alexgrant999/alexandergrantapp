'use client'
import { useEffect, useState } from 'react'

type Chapter = { id: string; no: string; name: string }

// The chapter index down the left edge. Tracks which chapter is on screen and lets the reader jump.
export function TourRail({ chapters }: { chapters: Chapter[] }) {
  const [active, setActive] = useState('')

  useEffect(() => {
    const sections = chapters.map(c => document.getElementById(c.id)).filter((el): el is HTMLElement => el !== null)
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActive(visible.target.id)
    }, { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.1, 0.5] })
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [chapters])

  return (
    <nav className={active ? 'rail rail-on' : 'rail'} aria-label="Chapters">
      <ol>
        {chapters.map(c => (
          <li key={c.id}>
            <a href={`#${c.id}`} aria-current={active === c.id ? 'location' : undefined}>
              <span className="rail-no">{c.no}</span>
              <span className="rail-name">{c.name}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
