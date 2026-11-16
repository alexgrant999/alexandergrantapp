'use client'
import { useEffect, useRef, useState } from 'react'

// Plays over the hero photo, which is the video's own first frame, so the page paints before the video arrives.
export function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null)
  const [stopped, setStopped] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const stopIfReduced = () => {
      if (reducedMotion.matches) setStopped(true)
    }
    stopIfReduced()
    reducedMotion.addEventListener('change', stopIfReduced)
    return () => reducedMotion.removeEventListener('change', stopIfReduced)
  }, [])

  useEffect(() => {
    const video = ref.current
    if (!video) return
    if (stopped) video.pause()
    else video.play().catch(() => {})
  }, [stopped])

  if (failed) return null

  return (
    <>
      <video ref={ref} className="hero-img" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} onError={() => setFailed(true)}>
        <source media="(max-width: 800px)" src="/videos/hero-mobile.mp4" type="video/mp4" />
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <button type="button" className="shot-toggle hero-toggle" aria-label="Pause background video" aria-pressed={stopped} onClick={() => setStopped(s => !s)}>
        <svg width="16" height="16" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          {stopped ? <path d="M3 1.5v9l7.5-4.5z" /> : <path d="M2.5 1.5H5v9H2.5zM7 1.5h2.5v9H7z" />}
        </svg>
      </button>
    </>
  )
}
