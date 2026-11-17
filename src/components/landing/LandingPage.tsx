import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { CALL_MINUTES } from '@/lib/services/booking'
import { BookingFlow } from '@/components/booking/BookingFlow'
import { BookingStyles } from '@/components/booking/BookingStyles'
import { WhatsAppLink } from '@/components/booking/ContactLinks'

const SITE_URL = 'https://alexandergrant.app'

export type Proof = { name: string; url: string; site: string; image: string; alt: string; summary: string; rows: string[][] }
export type Section = { heading: string; body?: string[]; bullets?: string[]; steps?: [string, string][] }
export type LandingContent = {
  path: string
  crumb: string
  title: string
  description: string
  h1: string
  lead: string
  before: Section[]
  proofHeading: string
  proofs: Proof[]
  after: Section[]
  related: { href: string; label: string }[]
}

type Query = Record<string, string | string[] | undefined>

export function landingMetadata(content: LandingContent): Metadata {
  const url = `${SITE_URL}${content.path}`
  return {
    title: content.title,
    description: content.description,
    alternates: { canonical: url },
    openGraph: { title: content.title, description: content.description, url, type: 'website', images: [`${SITE_URL}${content.proofs[0].image}`] },
    twitter: { card: 'summary_large_image', title: content.title, description: content.description },
  }
}

const STYLES = `
  .lp-hero { padding:clamp(32px,4.5vw,64px) 0 clamp(44px,5.5vw,80px); }
  .lp-h1 { margin:0; max-width:17ch; font:700 clamp(2.4rem,4.8vw,4.5rem)/1.02 'Besley',serif; letter-spacing:-.01em; }
  .lp-lead { margin:24px 0 0; max-width:50ch; font-size:clamp(1.125rem,1.4vw,1.3125rem); line-height:1.5; }
  .lp-sec { display:grid; grid-template-columns:minmax(0,5fr) minmax(0,7fr); gap:0 clamp(40px,7vw,120px); padding:clamp(36px,4.5vw,64px) 0; border-top:1px solid var(--ink); }
  .lp-h2 { margin:0; max-width:16ch; font:600 clamp(1.75rem,2.6vw,2.5rem)/1.08 'Besley',serif; letter-spacing:-.01em; }
  .lp-body > p { margin:0 0 14px; max-width:60ch; }
  .lp-bullets { list-style:none; margin:0; padding:0; border-top:1px solid var(--ink); }
  .lp-bullets li { padding:14px 0; border-bottom:1px solid var(--line); max-width:60ch; }
  .lp-body > p + .lp-bullets, .lp-body > p + .bk-next { margin-top:22px; }
  .lp-body > .bk-next { margin-top:0; }
  .lp-proofs { display:grid; gap:clamp(36px,4.5vw,56px); }
  .lp-proof-img { width:100%; height:auto; border:1px solid var(--line); }
  .lp-proof h3 { margin:20px 0 0; }
  .lp-proof .bk-ledger { margin-top:18px; }
  .lp-related { list-style:none; margin:0; padding:0; }
  .lp-book { scroll-margin-top:16px; }
  .lp-book-intro p { margin:16px 0 0; max-width:38ch; }
  @media (max-width:860px) {
    .lp-sec { grid-template-columns:minmax(0,1fr); }
    .lp-h2 { margin-bottom:22px; }
    .lp-h1 { font-size:clamp(2.25rem,9.5vw,3rem); }
  }
`

function SectionBlock({ section }: { section: Section }) {
  return (
    <section className="lp-sec">
      <h2 className="lp-h2">{section.heading}</h2>
      <div className="lp-body">
        {section.body?.map(p => <p key={p}>{p}</p>)}
        {section.bullets && <ul className="lp-bullets">{section.bullets.map(b => <li key={b}>{b}</li>)}</ul>}
        {section.steps && (
          <ol className="bk-next">
            {section.steps.map(([head, text]) => <li key={head}><span><b>{head}</b> {text}</span></li>)}
          </ol>
        )}
      </div>
    </section>
  )
}

/** One search landing page: the case in plain text, real client figures, and the booking flow at the foot. */
export function LandingPage({ content, searchParams }: { content: LandingContent; searchParams: Promise<Query> }) {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: content.crumb, item: `${SITE_URL}${content.path}` },
    ],
  }
  return (
    <div className="bk">
      <BookingStyles />
      <style>{STYLES}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <header className="bk-page bk-top">
        <Link className="bk-mark" href="/">Alexander Grant</Link>
        <a className="bk-textlink" href="#book">Book a call</a>
      </header>
      <main id="content" className="bk-page bk-main">
        <p className="bk-folio"><span>{content.crumb}</span><span>Alexander Grant, New York</span></p>
        <div className="lp-hero">
          <h1 className="lp-h1">{content.h1}</h1>
          <p className="lp-lead">{content.lead}</p>
          <div className="bk-actions">
            <a className="bk-button" href="#book">Book a {CALL_MINUTES} minute call</a>
            <WhatsAppLink className="bk-textlink">Message me on WhatsApp</WhatsAppLink>
          </div>
        </div>

        {content.before.map(s => <SectionBlock key={s.heading} section={s} />)}

        <section className="lp-sec">
          <h2 className="lp-h2">{content.proofHeading}</h2>
          <div className="lp-proofs">
            {content.proofs.map(proof => (
              <article key={proof.name} className="lp-proof">
                <Image className="lp-proof-img" src={proof.image} width={1280} height={800} alt={proof.alt} sizes="(max-width: 860px) 100vw, 58vw" />
                <h3 className="bk-h3">{proof.name}</h3>
                <p className="bk-copy">{proof.summary}</p>
                <table className="bk-ledger">
                  <tbody>{proof.rows.map(([label, figure]) => <tr key={label}><th scope="row">{label}</th><td>{figure}</td></tr>)}</tbody>
                </table>
                <p className="bk-copy">
                  <a className="bk-textlink" href={proof.url} target="_blank" rel="noopener noreferrer">{proof.site}<span className="sr-only"> (opens in a new tab)</span></a>
                </p>
              </article>
            ))}
          </div>
        </section>

        {content.after.map(s => <SectionBlock key={s.heading} section={s} />)}

        <section className="lp-sec lp-book" id="book">
          <div className="lp-book-intro">
            <h2 className="lp-h2">Book a {CALL_MINUTES} minute call</h2>
            <p>It’s free, and there’s no pitch. Tell me how the business runs today and I’ll tell you honestly whether I can help.</p>
            <p>Rather write? <WhatsAppLink className="bk-textlink">Message me on WhatsApp</WhatsAppLink></p>
          </div>
          <BookingFlow searchParams={searchParams} basePath={content.path} headingLevel={3} anchor="#book" />
        </section>

        <section className="lp-sec">
          <h2 className="lp-h2">Related</h2>
          <ul className="lp-related">
            {content.related.map(r => <li key={r.href}><Link className="bk-textlink" href={r.href}>{r.label}</Link></li>)}
            <li><Link className="bk-textlink" href="/">All of my work</Link></li>
          </ul>
        </section>
      </main>
      <footer className="bk-foot">
        <div className="bk-foot-in">
          <p>Alexander Grant, New York</p>
          <p>
            <WhatsAppLink>WhatsApp me</WhatsAppLink> or email{' '}
            <a href="mailto:alexandergrantapp@gmail.com" style={{ overflowWrap: 'anywhere' }}>alexandergrantapp@gmail.com</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
