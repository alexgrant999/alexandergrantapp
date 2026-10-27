'use client'
import { useEffect, useRef, useState } from 'react'

type ProductVideoProps = {
  slug: string
  label: string
  className?: string
}

export function ProductVideo({ slug, label, className }: ProductVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [poster, setPoster] = useState<string>()
  const [failed, setFailed] = useState(false)
  const [inView, setInView] = useState(false)
  const [stopped, setStopped] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    // Fetch the poster one screen ahead, so posters far down the page cost nothing until they are needed.
    const nearby = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      nearby.disconnect()
      const src = `/videos/${slug}.jpg`
      const img = new Image()
      img.onload = () => setPoster(src)
      img.onerror = () => setFailed(true)
      img.src = src
    }, { rootMargin: '100% 0px' })

    const visible = new IntersectionObserver(([entry]) => {
      setInView(entry.intersectionRatio >= 0.4)
    }, { threshold: [0, 0.4] })

    nearby.observe(video)
    visible.observe(video)
    return () => {
      nearby.disconnect()
      visible.disconnect()
    }
  }, [slug, failed])

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
    if (inView && !stopped) video.play().catch(() => {})
    else video.pause()
  }, [inView, stopped])

  if (failed) return null

  return (
    <div className={className}>
      <video
        ref={ref}
        src={`/videos/${slug}.mp4`}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        width={1280}
        height={800}
        aria-label={`${label}, product video`}
        onError={() => setFailed(true)}
      />
      <button
        type="button"
        className="shot-toggle"
        aria-label={`Pause ${label} video`}
        aria-pressed={stopped}
        onClick={() => setStopped(s => !s)}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          {stopped ? <path d="M3 1.5v9l7.5-4.5z" /> : <path d="M2.5 1.5H5v9H2.5zM7 1.5h2.5v9H7z" />}
        </svg>
      </button>
    </div>
  )
}
