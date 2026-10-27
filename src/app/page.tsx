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
  ['Playday', 'Multi-location booking for children’s studios', 'https://www.playday.com/tribeca', 'playday'],
  ['Teddy', 'Check-in calls between coaching sessions', 'https://www.teddycalls.com', 'teddy'],
  ['AcuApp', 'Board exam prep for acupuncturists', 'https://www.acuapp.io', 'acuapp'],
  ['Find Yoga Australia', 'Australia’s yoga studio and class directory', 'https://www.findyoga.com.au', 'findyoga'],
  ['Bali Spirit Festival', 'A festival schedule used by thousands', 'https://schedule.balispiritfestival.com', 'balispirit'],
  ['TRNZK Sewing Classes', 'Term bookings, deposits, and payments', 'https://sewing-class.vercel.app', 'sewing-class'],
  ['iEmerge', 'A wellness app on the iOS App Store', 'https://apps.apple.com/pl/app/iemerge-app/id6503445578', 'iemerge'],
]

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

export default function HomePage() {
  const band = photo('band')
  return (
    <>
      <style>{`
        :root { --paper:#f3f0e8; --ink:#191916; --red:#c42f24; --faint:#d6d1c5; --muted:#66635c; }
        * { box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        body { margin:0; background:var(--paper); color:var(--ink); font-family:'Instrument Sans',sans-serif; }
        ::selection { background:var(--red); color:white; }
        a { color:inherit; }
        :focus-visible { outline:3px solid var(--red); outline-offset:3px; }
        .site-header :focus-visible, .contact :focus-visible, footer :focus-visible { outline-color:var(--paper); }
        .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
        .page { width:min(1440px,100%); margin:auto; padding:0 clamp(18px,3.2vw,52px); }
        .site-header { position:absolute; top:0; left:0; right:0; z-index:3; }
        .nav { height:88px; display:grid; grid-template-columns:1fr auto 1fr; align-items:center; border-bottom:1px solid #f3f0e866; color:var(--paper); }
        .wordmark { font:800 1.05rem/1 'Instrument Serif',serif; letter-spacing:.01em; }
        .nav-mid { font-size:.875rem; text-transform:uppercase; letter-spacing:.1em; }
        .nav a { justify-self:end; padding:12px 0; font-size:1rem; text-underline-offset:6px; }
        .hero { position:relative; background:var(--ink); }
        .hero-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:58% 50%; filter:sepia(.08) saturate(.94); }
        .hero-shade { position:absolute; inset:0; background:linear-gradient(#191916cc, #19191600 32%), linear-gradient(to top, #19191659, #19191600 35%); }
        .hero-inner { position:relative; min-height:100svh; display:flex; flex-direction:column; padding-top:88px; padding-bottom:clamp(18px,3.2vw,52px); }
        .hero-box { margin-top:auto; width:min(580px,100%); padding:clamp(26px,3vw,44px); background:var(--paper); }
        .hero-tag { margin:0 0 20px; text-transform:uppercase; letter-spacing:.12em; font-size:.875rem; font-weight:700; color:var(--red); }
        h1 { margin:0; font:400 clamp(3.4rem,6vw,6rem)/.86 'Instrument Serif',serif; letter-spacing:-.05em; }
        h1 i { color:var(--red); font-weight:400; }
        .hero-bottom { margin-top:clamp(24px,3vw,38px); display:grid; grid-template-columns:1fr auto; gap:24px; align-items:center; }
        .hero-copy { font-size:clamp(1.125rem,1.3vw,1.2rem); line-height:1.5; margin:0; }
        .arrow-link { justify-self:end; display:flex; flex-direction:column; gap:4px; width:144px; height:144px; padding:12px; border-radius:50%; background:var(--red); color:white; align-items:center; justify-content:center; text-align:center; text-decoration:none; font-size:.875rem; line-height:1.3; text-transform:uppercase; letter-spacing:.06em; transition:transform .3s ease, border-radius .3s ease; }
        .arrow-link:hover { transform:rotate(-7deg) scale(1.04); border-radius:42% 58% 47% 53%; }
        .photo { display:block; width:100%; height:auto; background:var(--faint); filter:sepia(.08) saturate(.94); }
        .margin-note { margin:clamp(22px,2.6vw,32px) 0 0; font-family:'Caveat',cursive; font-size:1.5rem; line-height:1.1; transform:rotate(-2deg); }
        .scorecard { margin-top:16px; display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--ink); }
        .score { padding:16px 12px 0 0; }
        .score + .score { padding-left:14px; border-left:1px solid var(--faint); }
        .score strong { display:block; color:var(--red); font:400 clamp(1.55rem,2.1vw,2rem)/1 'Instrument Serif',serif; letter-spacing:-.02em; }
        .score span { display:block; margin-top:6px; font-size:.875rem; line-height:1.35; color:var(--muted); }
        .section { padding:clamp(80px,10vw,150px) 0; border-bottom:1px solid var(--ink); }
        .section-head { display:grid; grid-template-columns:1fr 2fr; gap:30px; margin-bottom:clamp(55px,8vw,105px); }
        .kicker { text-transform:uppercase; letter-spacing:.14em; font-size:.875rem; font-weight:700; color:var(--red); }
        h2 { margin:0; font:400 clamp(2.7rem,5.5vw,5.3rem)/.95 'Instrument Serif',serif; letter-spacing:-.04em; max-width:900px; }
        .case { display:grid; grid-template-columns:.8fr 1.2fr; border-top:1px solid var(--ink); }
        .case + .case { margin-top:100px; }
        .case-title { padding:28px 34px 40px 0; border-right:1px solid var(--ink); }
        .case-no { font-size:.875rem; letter-spacing:.15em; color:var(--red); }
        .case h3 { font:400 clamp(2.2rem,4vw,4.5rem)/1 'Instrument Serif',serif; margin:70px 0 8px; letter-spacing:-.04em; }
        .case-title > p { color:var(--muted); font-size:1.0625rem; margin:0; }
        .quote { margin:45px 0 0; font-family:'Instrument Serif',serif; font-size:1.25rem; line-height:1.35; max-width:390px; }
        .quote cite { display:block; font:500 .875rem/1.4 'Instrument Sans',sans-serif; text-transform:uppercase; letter-spacing:.11em; margin-top:16px; color:var(--muted); }
        .case-body { padding:34px 0 0 clamp(28px,5vw,78px); }
        .case-body > p { max-width:670px; font-size:clamp(1.08rem,1.6vw,1.36rem); line-height:1.55; margin:0 0 55px; }
        .metrics { display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--ink); }
        .metric { padding:25px 18px 30px 0; }
        .metric + .metric { padding-left:18px; border-left:1px solid var(--ink); }
        .metric b { display:block; color:var(--red); font:400 clamp(2.5rem,5vw,5rem)/.9 'Instrument Serif',serif; letter-spacing:-.04em; }
        .metric span { display:block; max-width:170px; margin-top:12px; font-size:.9375rem; line-height:1.35; }
        .offer-grid { display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--ink); }
        .offer { min-height:350px; padding:28px clamp(20px,3vw,42px) 35px 0; display:flex; flex-direction:column; }
        .offer + .offer { border-left:1px solid var(--ink); padding-left:clamp(20px,3vw,42px); }
        .offer-no { color:var(--red); font-size:.875rem; }
        .offer h3 { font:400 clamp(1.8rem,3vw,3rem)/1 'Instrument Serif',serif; margin:auto 0 22px; }
        .offer p { color:var(--muted); font-size:1.0625rem; line-height:1.55; margin:0; }
        .offer-grid { --gut:clamp(20px,3vw,42px); }
        .offer-photo { width:calc(100% + var(--gut) * 2); max-width:none; margin:24px calc(var(--gut) * -1) 30px; }
        .offer:first-child .offer-photo { width:calc(100% + var(--gut)); margin-left:0; }
        .offer-photo + h3 { margin-top:0; }
        .work-list { border-top:1px solid var(--ink); }
        .shot { position:relative; }
        .shot video { display:block; width:100%; height:auto; aspect-ratio:16/10; object-fit:cover; background:var(--paper); }
        .shot-toggle { position:absolute; right:8px; bottom:8px; z-index:2; display:grid; place-items:center; width:44px; height:44px; padding:0; border:1px solid var(--ink); border-radius:0; background:var(--paper); color:var(--ink); cursor:pointer; }
        .case-shot { margin-top:30px; }
        .project { position:relative; display:grid; grid-template-columns:70px minmax(0,1fr) minmax(0,1fr) 40px; gap:20px; align-items:baseline; padding:30px 0; border-bottom:1px solid var(--ink); }
        .project-link { text-decoration:none; outline:none; }
        .project-link:hover { text-decoration:underline; text-decoration-thickness:1px; text-underline-offset:6px; }
        .project-link::after { content:''; position:absolute; inset:0; z-index:1; }
        .project-link:focus-visible::after { outline:3px solid var(--red); outline-offset:4px; }
        .project-no { color:var(--red); font-size:.875rem; }
        .project-text { display:flex; flex-direction:column; gap:12px; }
        .project-name { margin:0; font:400 clamp(1.5rem,2.5vw,2.4rem)/1 'Instrument Serif',serif; }
        .project-desc { color:var(--muted); font-size:1.0625rem; line-height:1.45; max-width:34ch; }
        .project .shot { align-self:start; }
        .project-arrow { grid-column:-2; grid-row:1; justify-self:end; font-size:1.4rem; transition:transform .2s; }
        .project:hover .project-arrow { transform:translate(4px,-4px); }
        .contact { background:var(--red); color:#fff9ec; }
        .contact-inner { width:min(1440px,100%); margin:auto; padding:clamp(75px,10vw,145px) clamp(18px,3.2vw,52px); display:grid; grid-template-columns:1.2fr .8fr; gap:clamp(40px,8vw,130px); }
        .contact .kicker { margin:0 0 28px; }
        .contact h2 { font-size:clamp(3.5rem,8vw,8rem); line-height:.82; }
        .contact-copy { font-size:1.15rem; line-height:1.5; max-width:500px; margin:35px 0; }
        .email { display:inline-block; padding:12px 0; font-size:1rem; text-underline-offset:5px; }
        .form-wrap { align-self:end; }
        .footer a { align-self:flex-start; padding:12px 0; margin:-12px 0; text-underline-offset:5px; }
        .wa-form { display:flex; flex-direction:column; gap:0; border-top:1px solid #fff9ec; }
        .wa-label { padding-top:20px; font-size:.9375rem; font-weight:600; }
        .wa-input { width:100%; color:#fff9ec; background:transparent; border:0; border-bottom:1px solid #fff9ec; border-radius:0; padding:10px 0 16px; font:500 1.0625rem 'Instrument Sans',sans-serif; resize:vertical; }
        .wa-input::placeholder { color:#fff9eceb; }
        .wa-button { align-self:flex-start; margin-top:25px; border:1px solid #fff9ec; background:#fff9ec; color:var(--red); min-height:48px; padding:15px 22px; font:700 .875rem 'Instrument Sans',sans-serif; text-transform:uppercase; letter-spacing:.1em; cursor:pointer; transition:.2s; }
        .wa-button:hover { background:transparent; color:#fff9ec; }
        footer { background:var(--ink); color:var(--paper); }
        .footer { width:min(1440px,100%); margin:auto; padding:28px clamp(18px,3.2vw,52px); display:flex; justify-content:space-between; gap:20px; font-size:.875rem; text-transform:uppercase; letter-spacing:.12em; }
        @keyframes rise { from { opacity:0; transform:translateY(25px); } to { opacity:1; transform:none; } }
        .hero-box { animation:rise .8s .15s both cubic-bezier(.2,.8,.2,1); }
        @media (max-width:800px) {
          .nav { grid-template-columns:1fr auto; } .nav-mid { display:none; }
          .hero { background:var(--paper); }
          .hero-img, .hero-shade { bottom:auto; height:78svh; }
          .hero-img { object-position:50% 20%; }
          .hero-inner { min-height:0; }
          .hero-box { margin-top:52svh; }
          h1 { font-size:clamp(3.2rem,15vw,5rem); }
          .margin-note { display:none; }
          .section-head,.case,.contact-inner { grid-template-columns:1fr; }
          .case-title { border-right:0; padding-right:0; }
          .case h3 { margin-top:35px; }
          .case-body { padding:35px 0 0; }
          .offer-grid { grid-template-columns:1fr; }
          .offer { min-height:260px; }
          .offer-photo, .offer:first-child .offer-photo { width:calc(100% + var(--gut)); margin-left:0; }
          .offer + .offer { border-left:0; border-top:1px solid var(--ink); padding-left:0; }
          .project { grid-template-columns:38px minmax(0,1fr) 30px; gap:18px 12px; padding:24px 0 28px; }
          .project .shot { grid-column:1 / -1; }
          .contact-inner { gap:65px; }
          .footer { flex-direction:column; }
        }
        @media (max-width:520px) {
          .hero-bottom { grid-template-columns:1fr; }
          .arrow-link { justify-self:start; width:136px; height:136px; }
          .scorecard { grid-template-columns:1fr; }
          .score, .score + .score { display:flex; justify-content:space-between; align-items:baseline; gap:16px; padding:12px 0; border-left:0; border-bottom:1px solid var(--faint); }
          .score strong { order:2; font-size:1.4rem; }
          .score span { margin:0; font-size:.9375rem; }
          .metrics { grid-template-columns:1fr; }
          .metric + .metric { border-left:0; border-top:1px solid var(--ink); padding-left:0; }
          .metric span { max-width:none; }
        }
        @media (prefers-reduced-motion:reduce) { * { animation:none!important; scroll-behavior:auto!important; } }
      `}</style>

      <header className="site-header page">
        <nav className="nav" aria-label="Main navigation">
          <div className="wordmark">Alexander Grant</div>
          <div className="nav-mid">Growth + systems for independent business</div>
          <a href="#contact">Let’s talk <span aria-hidden="true">↘</span></a>
        </nav>
      </header>

      <main id="content">
      <section className="hero">
        {heroImage()}
        <div className="hero-shade" aria-hidden="true" />
        <div className="page hero-inner">
          <div className="hero-box">
            <p className="hero-tag">Independent growth partner</p>
            <h1>More sales.<br /><i>Less theatre.</i></h1>
            <div className="hero-bottom">
              <p className="hero-copy">I help independent shops grow with sharper advertising, useful automation, and software built around the way the business actually works.</p>
              <a className="arrow-link" href="#contact">Start a conversation <span aria-hidden="true">↓</span></a>
            </div>
            <p className="margin-note">The numbers should move. Everything else is commentary.</p>
            <div className="scorecard">
              <div className="score"><strong>+69%</strong><span>Adventureline July sales</span></div>
              <div className="score"><strong>35 families</strong><span>Playday opening weekend</span></div>
              <div className="score"><strong>Monthly</strong><span>Reporting</span></div>
            </div>
          </div>
        </div>
      </section>

      <div className="page">
        <section className="section" id="results">
          <header className="section-head"><p className="kicker">01 / The evidence</p><h2>Work that shows up in the till.</h2></header>
          <article className="case">
            <div className="case-title"><span className="case-no">CASE 01</span><h3>Adventureline</h3><p>Outdoor apparel · Australia</p><ProductVideo slug="adventureline" label="Adventureline" className="shot case-shot" /><blockquote className="quote">“Numbers are moving in the right direction which is great. Thanks again for steering us in the right direction!”<cite>Matt Browne, Owner</cite></blockquote></div>
            <div className="case-body"><p>I run Google and Meta advertising, SEO, and email as an ongoing partner. June became the biggest month in the brand’s history. Then, when the owners asked to lower costs, I cut ad spend by 29% and improved the return on every dollar.</p><div className="metrics"><div className="metric"><b>+69%</b><span>July sales, year on year</span></div><div className="metric"><b>+84%</b><span>July orders, year on year</span></div><div className="metric"><b>+34%</b><span>Winter season sales</span></div></div></div>
          </article>
          <article className="case">
            <div className="case-title"><span className="case-no">CASE 02</span><h3>Playday</h3><p>Children’s art studios · New York</p><blockquote className="quote">“Thanks so much for the incredible work you are putting into this.”<cite>Megan Smith, Director of Family Relations</cite></blockquote></div>
            <div className="case-body"><p>I replaced Wix with a booking platform built from scratch. Classes, payments, family messages, and marketing now live in one place. Their new Tribeca studio launched on it and filled its opening weekend.</p><div className="metrics"><div className="metric"><b>35</b><span>Families in opening weekend</span></div><div className="metric"><b>50</b><span>Children through the platform</span></div><div className="metric"><b>5.0</b><span>First-family feedback</span></div></div></div>
          </article>
        </section>

        {band && <Image className="photo band" src={band.src} width={band.width} height={band.height} alt={band.alt} sizes="(min-width: 1440px) 1350px, 100vw" />}

        <section className="section">
          <header className="section-head"><p className="kicker">02 / The work</p><h2>One pair of hands across growth and technology.</h2></header>
          <div className="offer-grid">{offers.map(([title,body,slot],i)=>{const img=photo(slot); return <article className="offer" key={slot}><span className="offer-no">0{i+1}</span>{img && <Image className="photo offer-photo" src={img.src} width={img.width} height={img.height} alt={img.alt} sizes="(max-width: 800px) 100vw, (min-width: 1440px) 450px, 32vw" />}<h3>{title}</h3><p>{body}</p></article>})}</div>
        </section>

        <section className="section">
          <header className="section-head"><p className="kicker">03 / Selected builds</p><h2>The site is part of the sales team.</h2></header>
          <div className="work-list">{work.map(([name,desc,href,slug],i)=><div className="project" key={name}><span className="project-no">0{i+1}</span><span className="project-text"><h3 className="project-name"><a className="project-link" href={href} target="_blank" rel="noopener noreferrer">{name}<span className="sr-only"> (opens in a new tab)</span></a></h3><span className="project-desc">{desc}</span></span><ProductVideo slug={slug} label={name} className="shot" /><span className="project-arrow" aria-hidden="true">↗</span></div>)}</div>
        </section>
      </div>

      <section className="contact" id="contact"><div className="contact-inner"><div><p className="kicker" style={{color:'inherit'}}>04 / Your turn</p><h2>Could it be doing better?</h2><p className="contact-copy">Tell me what you sell and where it feels stuck. I’ll take a look and give you a straight answer.</p><a className="email" href="mailto:alexandergrantapp@gmail.com">alexandergrantapp@gmail.com</a></div><div className="form-wrap"><WhatsAppForm /></div></div></section>
      </main>
      <footer><div className="footer"><span>Alexander Grant</span><span>New York · Working internationally</span><a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Photography from Pexels<span className="sr-only"> (opens in a new tab)</span></a><span>© 2026</span></div></footer>
    </>
  )
}
