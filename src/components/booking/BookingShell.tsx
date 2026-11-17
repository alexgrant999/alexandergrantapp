import Link from 'next/link'
import type { ReactNode } from 'react'
import { BookingStyles } from './BookingStyles'
import { WhatsAppLink } from './ContactLinks'

/**
 * One booking screen: the wordmark and a single way back, a ruled folio naming the step,
 * then two columns. The left holds the heading and what has been chosen so far; the right
 * holds the one decision this screen asks for. Below 860px they stack in that order.
 */
export function BookingShell({
  folio,
  step,
  back,
  intro,
  aside,
  children,
}: {
  folio: string
  step: string
  back?: { href: string; label: string }
  intro: ReactNode
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="bk">
      <BookingStyles />
      <header className="bk-page bk-top">
        <Link className="bk-mark" href="/">Alexander Grant</Link>
        {back
          ? <Link className="bk-textlink" href={back.href} prefetch={false}>{back.label}</Link>
          : <Link className="bk-textlink" href="/">See my work</Link>}
      </header>
      <main id="content" className="bk-page bk-main">
        <p className="bk-folio"><span>{folio}</span><span>{step}</span></p>
        <div className="bk-grid">
          <div className="bk-intro">{intro}</div>
          <div className="bk-step">{children}</div>
          {aside && <div className="bk-aside">{aside}</div>}
        </div>
      </main>
      <footer className="bk-foot">
        <div className="bk-foot-in">
          <p>Alexander Grant, New York</p>
          <p>
            Rather write? <WhatsAppLink>WhatsApp me</WhatsAppLink> or email{' '}
            <a href="mailto:alexandergrantapp@gmail.com" style={{ overflowWrap: 'anywhere' }}>alexandergrantapp@gmail.com</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
