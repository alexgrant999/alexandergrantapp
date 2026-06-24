import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const sans = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Celebrate with Alex · A Birthday by the Harbor',
  description:
    'Please join us — Saturday, July 11 at 6:30 PM in East Hampton, New York. A birthday by the harbor, under the fireworks. RSVP below.',
  openGraph: {
    title: 'Celebrate with Alex',
    description: 'A birthday by the harbor, under the fireworks. Saturday, July 11 · East Hampton, NY.',
    type: 'website',
  },
  robots: { index: false, follow: false },
}

const keyframes = `
  @keyframes flyTwinkle { 0%,100% { opacity:.25 } 50% { opacity:1 } }
  @keyframes flyPulse { 0%,100% { opacity:var(--burst-op,.55); transform:translate(-50%,-50%) scale(1) } 50% { opacity:calc(var(--burst-op,.55) + .18); transform:translate(-50%,-50%) scale(1.04) } }
  @keyframes flyCore { 0%,100% { opacity:.5; transform:translate(-50%,-50%) scale(.85) } 50% { opacity:1; transform:translate(-50%,-50%) scale(1.15) } }
  @keyframes flyReveal { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:translateY(0) } }
  .fly-reveal { opacity:0; animation:flyReveal 1.1s cubic-bezier(.21,.6,.35,1) forwards; }
  @media (prefers-reduced-motion: reduce) {
    .fly-reveal { animation: none; opacity: 1; }
    [data-fly-anim] { animation: none !important; }
  }
`

export default function BirthdayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${sans.variable}`}>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      {children}
    </div>
  )
}
