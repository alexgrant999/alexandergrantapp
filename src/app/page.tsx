import Image from 'next/image'
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

export default function HomePage() {
  const hero = photo('hero')
  const band = photo('band')
  return (
    <main>
      <style>{`
        :root { --paper:#f3f0e8; --ink:#191916; --red:#e43b2f; --faint:#d6d1c5; --muted:#66635c; }
        * { box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        body { margin:0; background:var(--paper); color:var(--ink); font-family:'Instrument Sans',sans-serif; }
        ::selection { background:var(--red); color:white; }
        a { color:inherit; }
        .page { width:min(1440px,100%); margin:auto; padding:0 clamp(18px,3.2vw,52px); }
        .nav { height:88px; display:grid; grid-template-columns:1fr auto 1fr; align-items:center; border-bottom:1px solid var(--ink); }
        .wordmark { font:800 1.05rem/1 'Instrument Serif',serif; letter-spacing:.01em; }
        .nav-mid { font-size:.72rem; text-transform:uppercase; letter-spacing:.16em; }
        .nav a { justify-self:end; text-decoration:none; border-bottom:1px solid; font-size:.86rem; padding-bottom:2px; }
        .hero { min-height:690px; display:grid; grid-template-columns:minmax(0,1.45fr) minmax(290px,.55fr); border-bottom:1px solid var(--ink); }
        .hero-main { padding:clamp(70px,10vw,150px) clamp(24px,5vw,78px) 70px 0; border-right:1px solid var(--ink); position:relative; }
        .hero-tag { margin:0 0 24px; text-transform:uppercase; letter-spacing:.14em; font-size:.72rem; font-weight:700; color:var(--red); }
        h1 { margin:0; max-width:980px; font:400 clamp(4.2rem,9.2vw,9rem)/.82 'Instrument Serif',serif; letter-spacing:-.055em; }
        h1 i { color:var(--red); font-weight:400; }
        .hero-bottom { margin-top:clamp(55px,8vw,110px); display:grid; grid-template-columns:1fr 1fr; gap:35px; align-items:end; }
        .hero-copy { max-width:520px; font-size:clamp(1.05rem,1.5vw,1.32rem); line-height:1.48; margin:0; }
        .arrow-link { justify-self:end; display:flex; width:154px; height:154px; border-radius:50%; background:var(--red); color:white; align-items:center; justify-content:center; text-align:center; text-decoration:none; font-size:.78rem; text-transform:uppercase; letter-spacing:.11em; transition:transform .3s ease, border-radius .3s ease; }
        .arrow-link:hover { transform:rotate(-7deg) scale(1.04); border-radius:42% 58% 47% 53%; }
        .hero-notes { display:flex; flex-direction:column; justify-content:space-between; padding:28px 0 32px clamp(24px,3vw,42px); }
        .photo { display:block; width:100%; height:auto; background:var(--faint); filter:sepia(.08) saturate(.94); }
        .hero-photo { margin:28px 0; }
        .margin-note { font-family:'Caveat',cursive; font-size:1.45rem; line-height:1.1; transform:rotate(-3deg); max-width:220px; }
        .scorecard { border-top:1px solid var(--ink); }
        .score-row { display:grid; grid-template-columns:1fr auto; padding:14px 0; border-bottom:1px solid var(--faint); font-size:.8rem; }
        .score-row strong { color:var(--red); font-size:1.05rem; }
        .section { padding:clamp(80px,10vw,150px) 0; border-bottom:1px solid var(--ink); }
        .section-head { display:grid; grid-template-columns:1fr 2fr; gap:30px; margin-bottom:clamp(55px,8vw,105px); }
        .kicker { text-transform:uppercase; letter-spacing:.17em; font-size:.7rem; font-weight:700; color:var(--red); }
        h2 { margin:0; font:400 clamp(2.7rem,5.5vw,5.3rem)/.95 'Instrument Serif',serif; letter-spacing:-.04em; max-width:900px; }
        .case { display:grid; grid-template-columns:.8fr 1.2fr; border-top:1px solid var(--ink); }
        .case + .case { margin-top:100px; }
        .case-title { padding:28px 34px 40px 0; border-right:1px solid var(--ink); }
        .case-no { font-size:.7rem; letter-spacing:.15em; color:var(--red); }
        .case h3 { font:400 clamp(2.2rem,4vw,4.5rem)/1 'Instrument Serif',serif; margin:70px 0 8px; letter-spacing:-.04em; }
        .case-title > p { color:var(--muted); margin:0; }
        .quote { margin:45px 0 0; font-family:'Instrument Serif',serif; font-size:1.25rem; line-height:1.35; max-width:390px; }
        .quote cite { display:block; font:500 .72rem/1.4 'Instrument Sans',sans-serif; text-transform:uppercase; letter-spacing:.11em; margin-top:16px; color:var(--muted); }
        .case-body { padding:34px 0 0 clamp(28px,5vw,78px); }
        .case-body > p { max-width:670px; font-size:clamp(1.08rem,1.6vw,1.36rem); line-height:1.55; margin:0 0 55px; }
        .metrics { display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--ink); }
        .metric { padding:25px 18px 30px 0; }
        .metric + .metric { padding-left:18px; border-left:1px solid var(--ink); }
        .metric b { display:block; color:var(--red); font:400 clamp(2.5rem,5vw,5rem)/.9 'Instrument Serif',serif; letter-spacing:-.04em; }
        .metric span { display:block; max-width:135px; margin-top:12px; font-size:.77rem; line-height:1.35; }
        .offer-grid { display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--ink); }
        .offer { min-height:350px; padding:28px clamp(20px,3vw,42px) 35px 0; display:flex; flex-direction:column; }
        .offer + .offer { border-left:1px solid var(--ink); padding-left:clamp(20px,3vw,42px); }
        .offer-no { color:var(--red); font-size:.72rem; }
        .offer h3 { font:400 clamp(1.8rem,3vw,3rem)/1 'Instrument Serif',serif; margin:auto 0 22px; }
        .offer p { color:var(--muted); line-height:1.55; margin:0; }
        .offer-grid { --gut:clamp(20px,3vw,42px); }
        .offer-photo { width:calc(100% + var(--gut) * 2); max-width:none; margin:24px calc(var(--gut) * -1) 30px; }
        .offer:first-child .offer-photo { width:calc(100% + var(--gut)); margin-left:0; }
        .offer-photo + h3 { margin-top:0; }
        .work-list { border-top:1px solid var(--ink); }
        .shot { position:relative; }
        .shot video { display:block; width:100%; height:auto; aspect-ratio:16/10; object-fit:cover; background:var(--paper); }
        .shot-toggle { position:absolute; right:8px; bottom:8px; z-index:2; display:grid; place-items:center; width:30px; height:30px; padding:0; border:1px solid var(--ink); border-radius:0; background:var(--paper); color:var(--ink); cursor:pointer; transition:opacity .2s; }
        .shot-toggle:focus-visible { outline:2px solid var(--red); outline-offset:2px; }
        @media (hover:hover) and (pointer:fine) {
          .shot-toggle { opacity:0; }
          .shot:hover .shot-toggle, .project:hover .shot-toggle, .shot-toggle:focus-visible, .shot-toggle[aria-pressed="true"] { opacity:1; }
        }
        .case-shot { margin-top:30px; }
        .project { position:relative; display:grid; grid-template-columns:70px minmax(0,1fr) minmax(0,1fr) 40px; gap:20px; align-items:baseline; padding:30px 0; border-bottom:1px solid var(--ink); }
        .project-link { text-decoration:none; outline:none; }
        .project-link::after { content:''; position:absolute; inset:0; z-index:1; }
        .project-link:focus-visible::after { outline:2px solid var(--red); outline-offset:4px; }
        .project-no { color:var(--red); font-size:.7rem; }
        .project-text { display:flex; flex-direction:column; gap:12px; }
        .project strong { font:400 clamp(1.4rem,2.5vw,2.4rem)/1 'Instrument Serif',serif; }
        .project-desc { color:var(--muted); line-height:1.45; max-width:34ch; }
        .project .shot { align-self:start; }
        .project-arrow { grid-column:-2; grid-row:1; justify-self:end; font-size:1.4rem; transition:transform .2s; }
        .project:hover .project-arrow { transform:translate(4px,-4px); }
        .contact { background:var(--red); color:#fff9ec; }
        .contact-inner { width:min(1440px,100%); margin:auto; padding:clamp(75px,10vw,145px) clamp(18px,3.2vw,52px); display:grid; grid-template-columns:1.2fr .8fr; gap:clamp(40px,8vw,130px); }
        .contact h2 { font-size:clamp(3.5rem,8vw,8rem); line-height:.82; }
        .contact-copy { font-size:1.15rem; line-height:1.5; max-width:500px; margin:35px 0; }
        .email { font-size:.85rem; text-underline-offset:4px; }
        .form-wrap { align-self:end; }
        .footer a { align-self:flex-start; border-bottom:1px solid; padding-bottom:2px; }
        .wa-form { display:flex; flex-direction:column; gap:0; border-top:1px solid #fff9ec; }
        .wa-input { width:100%; color:#fff9ec; background:transparent; border:0; border-bottom:1px solid #fff9ec; border-radius:0; padding:20px 0; font:500 1rem 'Instrument Sans',sans-serif; outline:none; resize:vertical; }
        .wa-input::placeholder { color:#fff9ecaa; }
        .wa-button { align-self:flex-start; margin-top:25px; border:1px solid #fff9ec; background:#fff9ec; color:var(--red); padding:15px 22px; font:700 .73rem 'Instrument Sans',sans-serif; text-transform:uppercase; letter-spacing:.1em; cursor:pointer; transition:.2s; }
        .wa-button:hover { background:transparent; color:#fff9ec; }
        footer { background:var(--ink); color:var(--paper); }
        .footer { width:min(1440px,100%); margin:auto; padding:28px clamp(18px,3.2vw,52px); display:flex; justify-content:space-between; gap:20px; font-size:.72rem; text-transform:uppercase; letter-spacing:.12em; }
        @keyframes rise { from { opacity:0; transform:translateY(25px); } to { opacity:1; transform:none; } }
        .hero-tag,h1,.hero-bottom { animation:rise .75s both cubic-bezier(.2,.8,.2,1); }
        h1 { animation-delay:.1s; } .hero-bottom { animation-delay:.2s; }
        @media (max-width:800px) {
          .nav { grid-template-columns:1fr auto; } .nav-mid { display:none; }
          .hero { grid-template-columns:1fr; min-height:0; }
          .hero-main { border-right:0; padding-right:0; }
          h1 { font-size:clamp(4rem,20vw,7rem); }
          .hero-notes { border-top:1px solid var(--ink); padding:25px 0; flex-direction:column; gap:25px; }
          .hero-photo { margin:0; max-width:460px; }
          .margin-note { display:none; } .scorecard { flex:1; }
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
          .arrow-link { justify-self:start; width:120px; height:120px; }
          .hero-notes { display:block; } .hero-photo { margin-bottom:25px; }
          .metrics { grid-template-columns:1fr; }
          .metric + .metric { border-left:0; border-top:1px solid var(--ink); padding-left:0; }
          .metric span { max-width:none; }
        }
        @media (prefers-reduced-motion:reduce) { * { animation:none!important; scroll-behavior:auto!important; } }
      `}</style>

      <div className="page">
        <nav className="nav" aria-label="Main navigation">
          <div className="wordmark">Alexander Grant</div>
          <div className="nav-mid">Growth + systems for independent business</div>
          <a href="#contact">Let’s talk ↘</a>
        </nav>

        <section className="hero">
          <div className="hero-main">
            <p className="hero-tag">Independent growth partner</p>
            <h1>More sales.<br /><i>Less theatre.</i></h1>
            <div className="hero-bottom">
              <p className="hero-copy">I help independent shops grow with sharper advertising, useful automation, and software built around the way the business actually works.</p>
              <a className="arrow-link" href="#contact">Start a<br />conversation ↓</a>
            </div>
          </div>
          <aside className="hero-notes" aria-label="At a glance">
            <p className="margin-note">The numbers should move.<br />Everything else is commentary.</p>
            {hero && <Image className="photo hero-photo" src={hero.src} width={hero.width} height={hero.height} alt={hero.alt} sizes="(max-width: 800px) 100vw, (min-width: 1440px) 330px, 25vw" preload />}
            <div className="scorecard">
              <div className="score-row"><span>Adventureline July sales</span><strong>+69%</strong></div>
              <div className="score-row"><span>Playday opening weekend</span><strong>35 families</strong></div>
              <div className="score-row"><span>Reporting</span><strong>Monthly</strong></div>
            </div>
          </aside>
        </section>

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
          <div className="work-list">{work.map(([name,desc,href,slug],i)=><div className="project" key={name}><span className="project-no">0{i+1}</span><span className="project-text"><a className="project-link" href={href} target="_blank" rel="noopener noreferrer"><strong>{name}</strong></a><span className="project-desc">{desc}</span></span><ProductVideo slug={slug} label={name} className="shot" /><span className="project-arrow" aria-hidden="true">↗</span></div>)}</div>
        </section>
      </div>

      <section className="contact" id="contact"><div className="contact-inner"><div><p className="kicker" style={{color:'inherit'}}>04 / Your turn</p><h2>Could it be doing better?</h2><p className="contact-copy">Tell me what you sell and where it feels stuck. I’ll take a look and give you a straight answer.</p><a className="email" href="mailto:alexandergrantapp@gmail.com">alexandergrantapp@gmail.com</a></div><div className="form-wrap"><WhatsAppForm /></div></div></section>
      <footer><div className="footer"><span>Alexander Grant</span><span>New York · Working internationally</span><a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Photography from Pexels</a><span>© 2026</span></div></footer>
    </main>
  )
}
