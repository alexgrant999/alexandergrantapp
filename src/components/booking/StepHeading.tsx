'use client'
import { useEffect, useRef, type ReactNode } from 'react'

// The path the last step heading mounted on. Same path again means the visitor moved a step, not that a page loaded.
let lastPath: string | null = null

/**
 * The heading for one step of the flow. Keyed by step, so it remounts on each move.
 * After a step change the link the visitor tapped is gone: focus comes here, and if the
 * flow's top has scrolled out of view (a long day list on a phone, or the flow sitting
 * halfway down a landing page) the flow is brought back to the top of the screen.
 */
export function StepHeading({ level, children }: { level: 2 | 3; children: ReactNode }) {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const path = window.location.pathname
    const moved = lastPath === path
    lastPath = path
    const heading = ref.current
    if (!moved || !heading) return
    const flow = heading.closest('.bk-flow')
    if (flow && flow.getBoundingClientRect().top < 0) flow.scrollIntoView({ block: 'start' })
    heading.focus({ preventScroll: true })
  }, [])

  const Tag = level === 3 ? 'h3' : 'h2'
  return <Tag ref={ref} tabIndex={-1} className="bk-h2">{children}</Tag>
}
