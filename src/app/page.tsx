import Image, { getImageProps } from 'next/image'
import { WhatsAppForm } from '@/components/WhatsAppForm'
import { ProductVideo } from '@/components/ProductVideo'
import photos from '../../public/images/home/images.json'

const photo = (slot: string) => photos.find(p => p.slot === slot)

const offers = [
  ['Find the demand.', 'Google and Meta ads, SEO, and email measured against real revenue, not a dashboard full of convenient numbers.', 'demand'],
  ['Build what is missing.', 'Bookings, ecommerce, and customer portals designed around how your staff and customers already behave.', 'build'],
  ['Make follow-up automatic.', 'Welcome series, reviews, abandoned carts, and SMS. Useful contact that keeps working after everyone goes home.', 'followup'],
]

const work = [
  ['Playday', 'Multi-location booking for children’s studios', 'https://www.playday.com/tribeca', 'playday', 'playday.com'],
  ['Teddy', 'Check-in calls between coaching sessions', 'https://www.teddycalls.com', 'teddy', 'teddycalls.com'],
  ['AcuApp', 'Board exam prep for acupuncturists', 'https://www.acuapp.io', 'acuapp', 'acuapp.io'],
  ['Find Yoga Australia', 'Australia’s yoga studio and class directory', 'https://www.findyoga.com.au', 'findyoga', 'findyoga.com.au'],
  ['Bali Spirit Festival', 'A festival schedule used by thousands', 'https://schedule.balispiritfestival.com', 'balispirit', 'balispiritfestival.com'],
  ['TRNZK Sewing Classes', 'Term bookings, deposits, and payments', 'https://sewing-class.vercel.app', 'sewing-class', 'Booking site'],
  ['iEmerge', 'A wellness app on the iOS App Store', 'https://apps.apple.com/pl/app/iemerge-app/id6503445578', 'iemerge', 'App Store'],
]

const adventureline = [['July sales, year on year', '+69%'], ['July orders, year on year', '+84%'], ['Winter season sales', '+34%']]
const playday = [['Families in the opening weekend', '35'], ['Children through the platform', '50'], ['First-family feedback', '5.0']]

// Art direction: a wide crop for desktop and a tall crop of the same photo for phones.
function heroImage() {
  const wide = photo('hero')
  const tall = photo('hero-mobile')
  if (!wide || !tall) return null
  const common = { alt: wide.alt, loading: 'eager', fetchPriority: 'high' } as const
  const { props: { srcSet: wideSet } } = getImageProps({ ...common, src: wide.src, width: wide.width, height: wide.height, sizes: '100vw' })
  // On phones the photo fills 78svh, so the tall crop renders a little wider than the viewport.
  const { props } = getImageProps({ ...common, src: tall.src, width: tall.width, height: tall.height, sizes: '115vw' })
  return (
    <picture>
      <source media="(min-width: 801px)" srcSet={wideSet} sizes="100vw" />
      <img {...props} className="hero-img" />
    </picture>
  )
}

// Figures set like an account book: blue row lines, a red double rule before the amount, a double rule under the last line.
function Ledger({ rows, caption, large }: { rows: string[][]; caption?: string; large?: boolean }) {
  return (
    <table className={large ? 'ledger ledger-lg' : 'ledger'}>
      {caption && <caption>{caption}</caption>}
      <tbody>{rows.map(([label, figure]) => <tr key={label}><th scope="row">{label}</th><td>{figure}</td></tr>)}</tbody>
    </table>
  )
}

export default function HomePage() {
  const band = photo('band')
  return (
    <>
      <style>{`
        /* --paper matches the background baked into the product videos, so they sit flush on the page. */
        :root { --paper:#f3f0e8; --ink:oklch(23% .02 155); --muted:oklch(45% .02 150); --green:oklch(38% .075 160); --green-deep:oklch(31% .06 160); --red:oklch(52% .17 27); --rule:oklch(80% .045 235); --line:oklch(86% .015 120); }
        * { box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        body { margin:0; background:var(--paper); color:var(--ink); font:400 1.0625rem/1.55 'Libre Franklin',sans-serif; }
        ::selection { background:var(--green); color:var(--paper); }
        a { color:inherit; }
        :focus-visible { outline:3px solid var(--green); outline-offset:3px; }
        .site-header :focus-visible, .contact :focus-visible, footer :focus-visible { outline-color:var(--paper); }
        .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
        h1, h2, h3 { font-family:'Besley',serif; font-weight:600; margin:0; }
        .page { width:min(1440px,100%); margin:auto; padding:0 clamp(18px,3.2vw,52px); }
        .site-header { position:absolute; top:0; left:0; right:0; z-index:3; }
        .nav { height:88px; display:grid; grid-template-columns:1fr auto 1fr; align-items:center; border-bottom:1px solid #f3f0e866; color:var(--paper); }
        .wordmark { font:700 1.25rem/1 'Besley',serif; }
        .nav-mid { font-size:.9375rem; }
        .nav a { justify-self:end; padding:12px 0; font-weight:600; text-underline-offset:6px; }
        .hero { position:relative; background:var(--ink); }
        .hero-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:58% 50%; filter:sepia(.08) saturate(.94); }
        .hero-shade { position:absolute; inset:0; background:linear-gradient(oklch(23% .02 155 / .8), oklch(23% .02 155 / 0) 32%), linear-gradient(to top, oklch(23% .02 155 / .35), oklch(23% .02 155 / 0) 35%); }
        .hero-inner { position:relative; min-height:100svh; display:flex; flex-direction:column; padding-top:88px; padding-bottom:clamp(18px,3.2vw,52px); }
        .hero-box { margin-top:auto; width:min(600px,100%); padding:clamp(26px,3vw,44px); background:var(--paper); }
        .hero-tag { margin:0 0 18px; font-weight:600; color:var(--green); }
        h1 { font-weight:700; font-size:clamp(3rem,5.2vw,5.2rem); line-height:1; letter-spacing:-.015em; }
        .hero-copy { margin:22px 0 0; font-size:clamp(1.125rem,1.3vw,1.1875rem); line-height:1.5; max-width:46ch; }
        .button { display:inline-flex; align-items:center; min-height:52px; margin-top:26px; padding:14px 24px; background:var(--green); color:var(--paper); border-radius:2px; font-weight:600; text-decoration:none; transition:background .2s; }
        .button:hover { background:var(--ink); }
        .ledger { width:100%; margin-top:34px; border-collapse:collapse; border-top:1px solid var(--ink); border-bottom:3px double var(--ink); font-variant-numeric:lining-nums tabular-nums; }
        .ledger caption { caption-side:top; text-align:left; padding-bottom:10px; font:italic 400 1.0625rem/1.4 'Besley',serif; }
        .ledger th { text-align:left; font-weight:400; padding:11px 16px 11px 0; color:var(--muted); }
        .ledger td { width:1%; white-space:nowrap; text-align:right; padding:8px 0 8px 18px; border-left:3px double var(--red); font:600 1.375rem/1.2 'Besley',serif; }
        .ledger tr + tr > * { border-top:1px solid var(--rule); }
        .ledger-lg td { padding:14px 0 14px 24px; font-size:clamp(1.75rem,2.6vw,2.4rem); }
        .ledger-lg th { padding:16px 20px 16px 0; font-size:1.0625rem; }
        .photo { display:block; width:100%; height:auto; background:var(--line); filter:sepia(.08) saturate(.94); }
        .section { padding:clamp(80px,10vw,140px) 0; border-bottom:1px solid var(--ink); }
        .section-head { display:grid; grid-template-columns:1fr 2fr; gap:30px; margin-bottom:clamp(50px,7vw,90px); }
        .kicker { margin:0; font-weight:600; color:var(--green); }
        h2 { font-size:clamp(2.2rem,4.2vw,3.8rem); line-height:1.05; letter-spacing:-.01em; max-width:20ch; }
        .case { display:grid; grid-template-columns:.8fr 1.2fr; border-top:1px solid var(--ink); }
        .case + .case { margin-top:90px; }
        .case-title { padding:26px 34px 40px 0; border-right:1px solid var(--line); }
        .case-no { font-size:.9375rem; color:var(--muted); }
        .case h3 { font-size:clamp(2rem,3.4vw,3.2rem); line-height:1; margin:40px 0 8px; }
        .case-title > p { color:var(--muted); margin:0; }
        .quote { margin:40px 0 0; font:italic 400 1.3125rem/1.4 'Besley',serif; max-width:390px; }
        .quote cite { display:block; margin-top:14px; font:600 .9375rem/1.4 'Libre Franklin',sans-serif; font-style:normal; color:var(--muted); }
        .case-body { padding:30px 0 0 clamp(28px,5vw,78px); }
        .case-body > p { max-width:62ch; font-size:clamp(1.0625rem,1.4vw,1.25rem); line-height:1.6; margin:0; }
        .offers { border-top:1px solid var(--ink); }
        .offer { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.15fr) minmax(0,.85fr); gap:clamp(24px,4vw,64px); align-items:start; padding:clamp(28px,3.5vw,44px) 0; border-bottom:1px solid var(--line); }
        .offer h3 { font-size:clamp(1.6rem,2.6vw,2.4rem); line-height:1.1; }
        .offer p { margin:0; max-width:46ch; color:var(--muted); font-size:1.125rem; line-height:1.6; }
        .work-list { border-top:1px solid var(--ink); }
        .shot { position:relative; }
        .shot video { display:block; width:100%; height:auto; aspect-ratio:16/10; object-fit:cover; background:var(--paper); }
        .shot-toggle { position:absolute; right:8px; bottom:8px; z-index:2; display:grid; place-items:center; width:44px; height:44px; padding:0; border:1px solid var(--ink); border-radius:2px; background:var(--paper); color:var(--ink); cursor:pointer; }
        .case-shot { margin-top:30px; }
        .project { position:relative; display:grid; grid-template-columns:minmax(0,1fr) minmax(0,1.1fr); gap:clamp(24px,4vw,64px); align-items:start; padding:30px 0; border-bottom:1px solid var(--line); }
        .project-link { text-decoration:none; outline:none; }
        .project-link::after { content:''; position:absolute; inset:0; z-index:1; }
        .project-link:focus-visible::after { outline:3px solid var(--green); outline-offset:4px; }
        .project-text { display:flex; flex-direction:column; gap:10px; }
        .project-name { font-size:clamp(1.6rem,2.6vw,2.4rem); line-height:1.05; }
        .project-desc { color:var(--muted); max-width:34ch; }
        .project-site { margin-top:8px; font-weight:600; color:var(--green); text-decoration:underline; text-underline-offset:5px; text-decoration-thickness:1px; }
        .project:hover .project-name { text-decoration:underline; text-decoration-thickness:2px; text-underline-offset:6px; }
        .contact { background:var(--green-deep); color:var(--paper); }
        .contact-inner { width:min(1440px,100%); margin:auto; padding:clamp(75px,10vw,140px) clamp(18px,3.2vw,52px); display:grid; grid-template-columns:1.2fr .8fr; gap:clamp(40px,8vw,130px); }
        .contact .kicker { margin:0 0 22px; color:inherit; }
        .contact h2 { font-size:clamp(3rem,6.4vw,6rem); line-height:1; max-width:14ch; }
        .contact-copy { font-size:1.1875rem; line-height:1.55; max-width:44ch; margin:30px 0; }
        .email { display:inline-block; padding:12px 0; font-weight:600; text-underline-offset:5px; }
        .form-wrap { align-self:end; }
        .wa-form { display:flex; flex-direction:column; gap:0; border-top:1px solid var(--paper); }
        .wa-label { padding-top:20px; font-size:.9375rem; font-weight:600; }
        .wa-input { width:100%; color:var(--paper); background:transparent; border:0; border-bottom:1px solid var(--paper); border-radius:0; padding:10px 0 16px; font:400 1.0625rem 'Libre Franklin',sans-serif; resize:vertical; }
        .wa-input::placeholder { color:#f3f0e8d9; }
        .wa-button { align-self:flex-start; min-height:52px; margin-top:26px; border:1px solid var(--paper); border-radius:2px; background:var(--paper); color:var(--green-deep); padding:14px 24px; font:600 1rem 'Libre Franklin',sans-serif; cursor:pointer; transition:background .2s, color .2s; }
        .wa-button:hover { background:transparent; color:var(--paper); }
        footer { background:var(--ink); color:var(--paper); }
        .footer { width:min(1440px,100%); margin:auto; padding:28px clamp(18px,3.2vw,52px); display:flex; justify-content:space-between; gap:20px; font-size:.9375rem; }
        .footer a { align-self:flex-start; padding:12px 0; margin:-12px 0; text-underline-offset:5px; }
        @keyframes rise { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
        .hero-box { animation:rise .7s .1s both cubic-bezier(.22,1,.36,1); }
        @media (max-width:800px) {
          .nav { grid-template-columns:1fr auto; } .nav-mid { display:none; }
          .hero { background:var(--paper); }
          .hero-img, .hero-shade { bottom:auto; height:78svh; }
          .hero-img { object-position:50% 20%; }
          .hero-inner { min-height:0; }
          .hero-box { margin-top:52svh; }
          h1 { font-size:clamp(2.25rem,9.5vw,4rem); }
          .section-head,.case,.contact-inner { grid-template-columns:1fr; }
          .case-title { border-right:0; padding-right:0; }
          .case h3 { margin-top:24px; }
          .case-body { padding:30px 0 0; }
          .offer { grid-template-columns:1fr; gap:18px; }
          .offer .photo { order:-1; }
          .project { grid-template-columns:1fr; gap:20px; padding:26px 0 30px; }
          .contact-inner { gap:60px; }
          .footer { flex-direction:column; }
        }
        @media (max-width:520px) {
          .ledger td { font-size:1.25rem; }
          .ledger-lg td { font-size:1.6rem; }
        }
        @media (prefers-reduced-motion:reduce) { * { animation:none!important; scroll-behavior:auto!important; } }
      `}</style>

      <header className="site-header page">
        <nav className="nav" aria-label="Main navigation">
          <div className="wordmark">Alexander Grant</div>
          <div className="nav-mid">Growth and systems for independent business</div>
          <a href="#contact">Let’s talk</a>
        </nav>
      </header>

      <main id="content">
      <section className="hero">
        {heroImage()}
        <div className="hero-shade" aria-hidden="true" />
        <div className="page hero-inner">
          <div className="hero-box">
            <p className="hero-tag">Independent growth partner</p>
            <h1>More sales.<br />Less theatre.</h1>
            <p className="hero-copy">I help independent shops grow with sharper advertising, useful automation, and software built around the way the business actually works.</p>
            <a className="button" href="#contact">Start a conversation</a>
            <Ledger caption="The numbers should move. Everything else is commentary." rows={[['Adventureline, July sales', '+69%'], ['Playday, opening weekend', '35 families'], ['Reporting', 'Monthly']]} />
          </div>
        </div>
      </section>

      <div className="page">
        <section className="section" id="results">
          <header className="section-head"><p className="kicker">The evidence</p><h2>Work that shows up in the till.</h2></header>
          <article className="case">
            <div className="case-title"><span className="case-no">Case one</span><h3>Adventureline</h3><p>Outdoor apparel, Australia</p><ProductVideo slug="adventureline" label="Adventureline" className="shot case-shot" /><blockquote className="quote">“Numbers are moving in the right direction which is great. Thanks again for steering us in the right direction!”<cite>Matt Browne, Owner</cite></blockquote></div>
            <div className="case-body"><p>I run Google and Meta advertising, SEO, and email as an ongoing partner. June became the biggest month in the brand’s history. Then, when the owners asked to lower costs, I cut ad spend by 29% and improved the return on every dollar.</p><Ledger rows={adventureline} large /></div>
          </article>
          <article className="case">
            <div className="case-title"><span className="case-no">Case two</span><h3>Playday</h3><p>Children’s art studios, New York</p><blockquote className="quote">“Thanks so much for the incredible work you are putting into this.”<cite>Megan Smith, Director of Family Relations</cite></blockquote></div>
            <div className="case-body"><p>I replaced Wix with a booking platform built from scratch. Classes, payments, family messages, and marketing now live in one place. Their new Tribeca studio launched on it and filled its opening weekend.</p><Ledger rows={playday} large /></div>
          </article>
        </section>

        {band && <Image className="photo band" src={band.src} width={band.width} height={band.height} alt={band.alt} sizes="(min-width: 1440px) 1350px, 100vw" />}

        <section className="section">
          <header className="section-head"><p className="kicker">The work</p><h2>One pair of hands across growth and technology.</h2></header>
          <div className="offers">{offers.map(([title,body,slot])=>{const img=photo(slot); return <article className="offer" key={slot}><h3>{title}</h3><p>{body}</p>{img && <Image className="photo" src={img.src} width={img.width} height={img.height} alt={img.alt} sizes="(max-width: 800px) 100vw, (min-width: 1440px) 400px, 28vw" />}</article>})}</div>
        </section>

        <section className="section">
          <header className="section-head"><p className="kicker">Selected builds</p><h2>The site is part of the sales team.</h2></header>
          <div className="work-list">{work.map(([name,desc,href,slug,site])=><div className="project" key={name}><span className="project-text"><h3 className="project-name"><a className="project-link" href={href} target="_blank" rel="noopener noreferrer">{name}<span className="sr-only"> (opens in a new tab)</span></a></h3><span className="project-desc">{desc}</span><span className="project-site" aria-hidden="true">{site}</span></span><ProductVideo slug={slug} label={name} className="shot" /></div>)}</div>
        </section>
      </div>

      <section className="contact" id="contact"><div className="contact-inner"><div><p className="kicker">Your turn</p><h2>Could it be doing better?</h2><p className="contact-copy">Tell me what you sell and where it feels stuck. I’ll take a look and give you a straight answer.</p><a className="email" href="mailto:alexandergrantapp@gmail.com">alexandergrantapp@gmail.com</a></div><div className="form-wrap"><WhatsAppForm /></div></div></section>
      </main>
      <footer><div className="footer"><span>Alexander Grant</span><span>New York, working internationally</span><a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Photography from Pexels<span className="sr-only"> (opens in a new tab)</span></a><span>© 2026</span></div></footer>
    </>
  )
}
