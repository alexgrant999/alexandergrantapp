import Image, { getImageProps } from 'next/image'
import type { ReactNode } from 'react'
import { WhatsAppForm } from '@/components/WhatsAppForm'
import { ProductVideo } from '@/components/ProductVideo'
import { TourRail } from '@/components/TourRail'
import { Ledger } from '@/components/Ledger'
import { HeroLedger, type ClientTab } from '@/components/HeroLedger'
import photos from '../../public/images/home/images.json'

const photo = (slot: string) => photos.find(p => p.slot === slot)

const chapters = [
  { id: 'about', no: '01', name: 'Who I am' },
  { id: 'adventureline', no: '02', name: 'Adventureline' },
  { id: 'playday', no: '03', name: 'Playday' },
  { id: 'services', no: '04', name: 'How I work' },
  { id: 'builds', no: '05', name: 'More builds' },
  { id: 'contact', no: '06', name: 'Talk to me' },
]

const services = [
  ['Ads and search', 'Google and Meta ads, SEO and email. I judge them by what shows up in your sales each month, and you get the same report I read.', 'demand'],
  ['Booking and store software', 'When off-the-shelf tools don’t fit, I build bookings, online stores, invoicing and customer portals around the way your staff and customers already work.', 'build'],
  ['Email and text follow-up', 'Welcome emails, review requests, cart reminders and text messages that go out on their own, including after you close for the day.', 'followup'],
]

const work = [
  ['Teddy', 'Check-in calls between coaching sessions', 'https://www.teddycalls.com', 'teddy', 'teddycalls.com'],
  ['AcuApp', 'Board exam prep for acupuncturists', 'https://www.acuapp.io', 'acuapp', 'acuapp.io'],
  ['Find Yoga Australia', 'Australia’s yoga studio and class directory', 'https://www.findyoga.com.au', 'findyoga', 'findyoga.com.au'],
  ['Bali Spirit Festival', 'A festival schedule used by 4,941 people in festival week', 'https://schedule.balispiritfestival.com', 'balispirit', 'balispiritfestival.com'],
  ['TRNZK Sewing Classes', 'Term bookings, deposits, and payments', 'https://sewing-class.vercel.app', 'sewing-class', 'Booking site'],
  ['iEmerge', 'A wellness app on the iOS App Store', 'https://apps.apple.com/pl/app/iemerge-app/id6503445578', 'iemerge', 'App Store'],
]

// One tab per client in the hero. Client-approved figures only; the label says what the number is.
const heroTabs: ClientTab[] = [
  { id: 'adventureline', name: 'Adventureline', image: '/videos/adventureline.jpg', alt: 'The Adventureline online store', improved: 'Took over Google and Meta ads, SEO and email for an outdoor apparel store on Shopify. Rewrote 22 collections and 57 products for search.', rows: [['July sales, year on year', '+69%'], ['July orders, year on year', '+84%'], ['Search position, July, year on year', '31 to 17']] },
  { id: 'playday', name: 'Playday', image: '/videos/playday.jpg', alt: 'The Playday booking site', improved: 'Replaced a Wix site with a booking platform for a chain of children’s art studios: bookings, Square payments, invoicing and automated follow-up.', rows: [['Studios live on it, two more in November', '5'], ['People using it since the August launch', '26,235'], ['Children added by their families', '760']] },
  { id: 'findyoga', name: 'Find Yoga', image: '/videos/findyoga.jpg', alt: 'The Find Yoga Australia directory', improved: 'Rebuilt Australia’s yoga directory from a legacy site into a fast, searchable one, with every studio, class and event in one place.', rows: [['Listings', '6,478'], ['Events published', '15,727'], ['Google impressions, August to October', '400,000']] },
  { id: 'balispirit', name: 'Bali Spirit', image: '/videos/balispirit.jpg', alt: 'The Bali Spirit Festival schedule app', improved: 'A festival schedule that works offline on the field, replacing scheduling software that cost the festival more than $7,000 a year.', rows: [['People using it during festival week', '4,941'], ['Sessions scheduled', '450+'], ['Average time in the app per visit', '8 min']] },
  { id: 'trnzk', name: 'TRNZK', image: '/videos/sewing-class.jpg', alt: 'The TRNZK sewing class booking site', improved: 'Term bookings with deposits, payment plans and class caps for a sewing school in Lennox Head. The owner now changes dates each term and little else.', rows: [['Terms booked through it', '3'], ['Weekly class slots', '7'], ['Pay by', 'Deposit and balance']] },
]

const adventureline = [['July sales, year on year', '+69%'], ['July orders, year on year', '+84%'], ['Winter season sales', '+34%']]
const playday = [['Studios live on it, two more in November', '5'], ['People using it since the August launch', '26,235'], ['Families booked, Tribeca opening weekend', '35']]

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

// A chapter heading set like the head of a ledger page: the account name on the left, its folio on the right.
function Folio({ name, no }: { name: string; no: string }) {
  return <p className="folio"><span>{name}</span><span>No. {no}</span></p>
}

// One step of a chapter. On desktop the chapter's media stays pinned while these scroll past.
function Step({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <div className="step">
      <div className="step-in">
        <p className="step-kicker">{kicker}</p>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  )
}

export default function HomePage() {
  const band = photo('band')
  const build = photo('build')
  return (
    <>
      <style>{`
        /* --paper matches the background baked into the product videos, so they sit flush on the page. */
        :root { --paper:#f3f0e8; --ink:oklch(23% .02 155); --muted:oklch(45% .02 150); --green:oklch(38% .075 160); --green-deep:oklch(31% .06 160); --red:oklch(52% .17 27); --rule:oklch(80% .045 235); --line:oklch(86% .015 120); --gutter:clamp(18px,3.2vw,52px); }
        * { box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        body { margin:0; background:var(--paper); color:var(--ink); font:400 1.0625rem/1.55 'Libre Franklin',sans-serif; }
        ::selection { background:var(--green); color:var(--paper); }
        a { color:inherit; }
        :focus-visible { outline:3px solid var(--green); outline-offset:3px; }
        .site-header :focus-visible, .contact :focus-visible, footer :focus-visible { outline-color:var(--paper); }
        .sr-only, .count-static { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
        .count-static { position:static; width:auto; height:auto; margin:0; overflow:visible; clip:auto; }
        h1, h2, h3 { font-family:'Besley',serif; font-weight:600; margin:0; letter-spacing:-.01em; }
        .page { width:min(1440px,100%); margin:auto; padding:0 var(--gutter); }

        /* A thin ink line across the top of the screen fills as the reader moves through the page. */
        .progress { position:fixed; top:0; left:0; right:0; height:3px; z-index:5; background:var(--green); transform-origin:left; transform:scaleX(0); }

        .site-header { position:absolute; top:0; left:0; right:0; z-index:3; }
        .nav { height:88px; display:grid; grid-template-columns:1fr auto 1fr; align-items:center; border-bottom:1px solid #f3f0e866; color:var(--paper); }
        .wordmark { font:700 1.25rem/1 'Besley',serif; }
        .nav-mid { font-size:.9375rem; }
        .nav a { justify-self:end; padding:12px 0; font-weight:600; text-underline-offset:6px; }

        .hero { position:relative; background:var(--ink); }
        .hero-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; object-position:58% 50%; filter:sepia(.08) saturate(.94); }
        .hero-shade { position:absolute; inset:0; background:linear-gradient(oklch(23% .02 155 / .8), oklch(23% .02 155 / 0) 32%), linear-gradient(to top, oklch(23% .02 155 / .35), oklch(23% .02 155 / 0) 35%); }
        .hero-inner { position:relative; min-height:100svh; display:flex; flex-direction:column; padding-top:88px; padding-bottom:var(--gutter); }
        .hero-box { margin-top:auto; width:min(700px,100%); padding:clamp(26px,3vw,44px); background:var(--paper); }
        h1 { font-weight:700; font-size:clamp(2.6rem,4vw,3.75rem); line-height:1.02; }
        .hero-copy { margin:22px 0 0; font-size:clamp(1.125rem,1.3vw,1.1875rem); line-height:1.5; max-width:46ch; }
        .hero-actions { display:flex; flex-wrap:wrap; align-items:center; gap:10px 28px; margin-top:26px; }
        .button { display:inline-flex; align-items:center; min-height:52px; padding:14px 24px; background:var(--green); color:var(--paper); border-radius:2px; font-weight:600; text-decoration:none; transition:background .2s; }
        .button:hover { background:var(--ink); }
        .textlink { padding:12px 0; font-weight:600; text-underline-offset:5px; }

        /* The hero ledger: one client at a time, turning every few seconds, with the active tab's red rule filling as it waits. */
        .hl { margin-top:30px; }
        .hl-caption { margin:0 0 6px; font:italic 400 1.0625rem/1.4 'Besley',serif; }
        .hl-tabs { display:flex; flex-wrap:wrap; gap:0 18px; border-bottom:1px solid var(--line); }
        .hl-tab { position:relative; margin:0; padding:9px 0; background:none; border:0; font:600 .875rem/1.2 'Libre Franklin',sans-serif; color:var(--muted); cursor:pointer; transition:color .2s; }
        .hl-tab:hover { color:var(--ink); }
        .hl-tab[aria-selected="true"] { color:var(--ink); }
        .hl-tab[aria-selected="true"]::after { content:''; position:absolute; left:0; right:0; bottom:-1px; height:2px; background:var(--red); transform-origin:left; animation:fill 7s linear both; }
        .hl-paused .hl-tab::after { animation-play-state:paused; }
        .hl-panel { display:grid; grid-template-columns:220px minmax(0,1fr); gap:0 22px; align-items:start; padding-top:16px; animation:settle .35s ease both; }
        .hl-image { display:block; width:100%; height:auto; border:1px solid var(--line); background:var(--line); }
        .hl-improved { margin:0; color:var(--muted); font-size:.9375rem; line-height:1.5; max-width:46ch; }
        .hl .ledger { margin-top:12px; }
        @media (max-width:560px) { .hl-panel { grid-template-columns:1fr; gap:14px 0; } .hl-image { aspect-ratio:16/8; object-fit:cover; object-position:top; } }
        .hl .ledger td { font-size:1.25rem; }
        @media (prefers-reduced-motion:reduce) { .hl-tab[aria-selected="true"]::after, .hl-panel { animation:none; } .hl-tab[aria-selected="true"]::after { transform:none; } }
        .ledger { width:100%; margin-top:34px; border-collapse:collapse; border-top:1px solid var(--ink); border-bottom:3px double var(--ink); font-variant-numeric:lining-nums tabular-nums; }
        .ledger caption { caption-side:top; text-align:left; padding-bottom:10px; font:italic 400 1.0625rem/1.4 'Besley',serif; }
        .ledger th { text-align:left; font-weight:400; padding:11px 16px 11px 0; color:var(--muted); }
        .ledger td { width:1%; white-space:nowrap; text-align:right; padding:8px 0 8px 18px; border-left:3px double var(--red); font:600 1.375rem/1.2 'Besley',serif; }
        .ledger tr + tr > * { border-top:1px solid var(--rule); }
        /* The money row is the loudest thing in its chapter. Headlines step down from it. */
        .ledger-lg td { padding:14px 0 14px 24px; font-size:clamp(2.4rem,4.5vw,4rem); line-height:1; }
        .ledger-lg th { padding:16px 20px 16px 0; font-size:1.0625rem; }

        .photo { display:block; width:100%; height:auto; background:var(--line); filter:sepia(.08) saturate(.94); }
        .shot { position:relative; }
        .shot video { display:block; width:100%; height:auto; aspect-ratio:16/10; object-fit:cover; background:var(--paper); }
        .shot-toggle { position:absolute; right:8px; bottom:8px; z-index:2; display:grid; place-items:center; width:44px; height:44px; padding:0; border:1px solid var(--ink); border-radius:2px; background:var(--paper); color:var(--ink); cursor:pointer; }

        .folio { display:flex; justify-content:space-between; gap:20px; margin:0; padding:10px 0; border-top:1px solid var(--ink); border-bottom:1px solid var(--line); font-size:.9375rem; font-weight:600; font-variant-numeric:lining-nums tabular-nums; }
        .folio span + span { font-weight:400; color:var(--muted); }
        .contact .folio { border-color:var(--paper); }
        .contact .folio span + span { color:inherit; opacity:.75; }

        /* The chapter rail: a small index down the left edge on wide screens. */
        .rail { position:fixed; left:clamp(10px,1.4vw,22px); top:50%; z-index:4; transform:translateY(-50%); opacity:0; transition:opacity .3s; pointer-events:none; }
        .rail-on { opacity:1; pointer-events:auto; }
        .rail ol { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:2px; }
        .rail a { display:flex; align-items:baseline; gap:10px; padding:6px 8px; font-size:.8125rem; text-decoration:none; color:var(--muted); border-left:2px solid transparent; transition:color .2s, border-color .2s; }
        .rail-no { font-variant-numeric:lining-nums tabular-nums; }
        .rail-name { opacity:0; transform:translateX(-4px); transition:opacity .2s, transform .2s; }
        .rail:hover .rail-name, .rail:focus-within .rail-name { opacity:1; transform:none; }
        .rail a[aria-current] { color:var(--ink); border-color:var(--red); font-weight:600; }
        @media (max-width:1180px) { .rail { display:none; } }
        @media (min-width:1181px) and (max-width:1560px) { .page, .contact-inner, .footer { padding-left:calc(var(--gutter) + 34px); } }

        /* Chapter one: a short introduction over a photo band. */
        .about { padding:clamp(56px,7vw,96px) 0 0; }
        .about-grid { display:grid; grid-template-columns:1.1fr .9fr; gap:clamp(30px,5vw,80px); align-items:end; margin-top:clamp(28px,4vw,48px); padding-bottom:clamp(56px,7vw,96px); }
        .about h2 { font-size:clamp(2.2rem,4vw,3.6rem); line-height:1.04; max-width:16ch; }
        .about-copy { font-size:clamp(1.0625rem,1.4vw,1.25rem); line-height:1.6; max-width:48ch; margin:0; }
        .about-copy + .about-copy { margin-top:1em; }
        .about .ledger { margin-top:30px; }

        /* Case chapters: media pinned on one side, steps scroll past on the other. */
        .case { padding-top:clamp(56px,7vw,96px); }
        .case-grid { display:grid; grid-template-columns:1fr 1fr; gap:clamp(30px,5vw,80px); margin-top:clamp(20px,3vw,36px); }
        .case-media { position:sticky; top:0; align-self:start; height:100svh; display:flex; flex-direction:column; justify-content:center; padding:24px 0; }
        .case-media h2 { font-size:clamp(2.2rem,3.6vw,3.4rem); line-height:1.02; margin-bottom:6px; }
        .case-media > p { color:var(--muted); margin:0 0 26px; }
        /* The video is sized from the viewport height so the heading, video and quote all fit beside the steps. */
        .case-media .shot { width:min(100%,64svh); border:1px solid var(--line); }
        .quote { margin:28px 0 0; font:italic 400 1.3125rem/1.4 'Besley',serif; max-width:420px; }
        .quote cite { display:block; margin-top:14px; font:600 .9375rem/1.4 'Libre Franklin',sans-serif; font-style:normal; color:var(--muted); }
        .steps { padding-bottom:0; }
        .step { min-height:72svh; display:flex; align-items:center; padding:6svh 0; }
        /* The last step sits at the foot of its chapter so the pinned media is still in view when the ledger arrives. */
        .step:last-child { min-height:100svh; align-items:flex-end; padding-bottom:10svh; }
        .step-in { max-width:52ch; }
        .step-kicker { margin:0 0 14px; padding-bottom:8px; border-bottom:1px solid var(--ink); font-size:.9375rem; font-weight:600; font-variant-numeric:lining-nums tabular-nums; }
        .step h3 { font-size:clamp(1.75rem,2.6vw,2.4rem); line-height:1.1; }
        .step p { font-size:clamp(1.0625rem,1.4vw,1.25rem); line-height:1.6; margin:16px 0 0; }
        .step ul { margin:16px 0 0; padding:0; list-style:none; border-top:1px solid var(--ink); }
        .step li { display:grid; grid-template-columns:minmax(0,.55fr) minmax(0,1fr); gap:16px; padding:10px 0; border-bottom:1px solid var(--line); font-size:1.0625rem; line-height:1.45; }
        .step li b { font-weight:600; }
        .step li span { color:var(--muted); }
        .step .ledger { margin-top:24px; }
        .case + .case { margin-top:0; }
        .case-end { border-bottom:3px double var(--ink); }

        /* Chapter four: the words stay put while the three photographs scroll by. */
        .services { padding:clamp(56px,7vw,96px) 0; border-bottom:1px solid var(--ink); }
        .services-grid { display:grid; grid-template-columns:.9fr 1.1fr; gap:clamp(30px,5vw,80px); margin-top:clamp(20px,3vw,36px); }
        .services-text { position:sticky; top:0; align-self:start; height:100svh; display:flex; flex-direction:column; justify-content:center; }
        .services h2 { font-size:clamp(2.2rem,3.6vw,3.4rem); line-height:1.04; max-width:14ch; }
        .services-text > p { font-size:clamp(1.0625rem,1.4vw,1.25rem); line-height:1.6; max-width:40ch; margin:22px 0 0; }
        .offer { display:grid; grid-template-columns:3.5rem 1fr; gap:0 16px; padding:clamp(40px,6vw,80px) 0; border-bottom:1px solid var(--line); }
        .offer:first-child { padding-top:0; }
        .offer-no { grid-row:1 / span 3; padding-top:.35rem; font:600 .9375rem/1 'Libre Franklin',sans-serif; color:var(--muted); font-variant-numeric:lining-nums tabular-nums; }
        .offer .photo { margin-bottom:22px; }
        .offer h3 { font-size:clamp(1.6rem,2.4vw,2.2rem); line-height:1.1; }
        .offer p { margin:10px 0 0; max-width:48ch; color:var(--muted); font-size:1.125rem; line-height:1.55; }

        /* Chapter five: a dense index. */
        .builds { padding:clamp(56px,7vw,96px) 0; border-bottom:1px solid var(--ink); }
        .builds h2 { font-size:clamp(1.9rem,3vw,2.8rem); line-height:1.08; max-width:16ch; margin:clamp(28px,4vw,48px) 0 clamp(26px,3vw,40px); }
        .work-list { border-top:1px solid var(--ink); }
        .project { position:relative; display:grid; grid-template-columns:minmax(0,.65fr) minmax(0,1.35fr) 280px; gap:clamp(20px,3vw,48px); align-items:center; padding:18px 0; border-bottom:1px solid var(--line); }
        .project-link { text-decoration:none; outline:none; }
        .project-link::after { content:''; position:absolute; inset:0; z-index:1; }
        .project-link:focus-visible::after { outline:3px solid var(--green); outline-offset:4px; }
        .project-name { font-size:clamp(1.35rem,1.9vw,1.75rem); line-height:1.1; }
        .project-desc { display:block; color:var(--muted); max-width:34ch; }
        .project-site { display:block; margin-top:6px; font-size:.9375rem; font-weight:600; color:var(--green); text-decoration:underline; text-underline-offset:5px; text-decoration-thickness:1px; }
        .project:hover .project-name { text-decoration:underline; text-decoration-thickness:2px; text-underline-offset:6px; }

        .contact { background:var(--green-deep); color:var(--paper); }
        .contact-inner { width:min(1440px,100%); margin:auto; padding:clamp(60px,8vw,110px) var(--gutter) clamp(75px,10vw,140px); }
        .contact-grid { display:grid; grid-template-columns:1.2fr .8fr; gap:clamp(40px,8vw,130px); margin-top:clamp(40px,6vw,80px); }
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
        .footer { width:min(1440px,100%); margin:auto; padding:28px var(--gutter); display:flex; justify-content:space-between; gap:20px; font-size:.9375rem; }
        .footer a { align-self:flex-start; padding:12px 0; margin:-12px 0; text-underline-offset:5px; }

        /* Scroll-linked motion. Tied to the reader's own scrolling, never to a clock, and only where the browser supports it natively. */
        @property --n { syntax:'<integer>'; inherits:false; initial-value:0; }
        @keyframes fill { to { transform:scaleX(1); } }
        @keyframes rise { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:none; } }
        @keyframes settle { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        @keyframes count { from { --n:0; } to { --n:var(--to); } }
        @supports (animation-timeline: scroll()) {
          @media (prefers-reduced-motion: no-preference) {
            .progress { animation:fill linear both; animation-timeline:scroll(root); }
            .step-in { animation:rise linear both; animation-timeline:view(); animation-range:entry 10% entry 45%; }
            .offer, .about-grid > *, .builds .project, .ledger-lg tr { animation:settle linear both; animation-timeline:view(); animation-range:entry 0% entry 30%; }
            .count-static { position:absolute; width:1px; height:1px; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); }
            .count::before { content:attr(data-prefix); }
            .count::after { content:counter(n) attr(data-suffix); counter-reset:n var(--n); animation:count linear both; animation-timeline:view(); animation-range:entry 15% entry 70%; }
          }
        }

        /* Tablets and small laptops: the chapters stack, media first, and the steps read as plain sections. */
        @media (max-width:1023px) {
          .case-grid, .services-grid { grid-template-columns:1fr; gap:0; }
          .case-media, .services-text { position:static; height:auto; padding:0 0 10px; }
          .case-media .shot { width:min(100%,720px); }
          .services-text > p { margin-bottom:30px; }
          .step, .step:last-child { min-height:0; align-items:flex-start; padding:28px 0; }
          .steps { padding-bottom:20px; }
          .offer { padding:36px 0; }
        }
        @media (max-width:980px) {
          .project { grid-template-columns:minmax(0,1fr) 220px; }
          .project-desc { grid-column:1; }
          .project .shot { grid-column:2; grid-row:1 / span 2; }
        }
        @media (max-width:800px) {
          .nav { grid-template-columns:1fr auto; } .nav-mid { display:none; }
          .hero { background:var(--paper); }
          .hero-img, .hero-shade { bottom:auto; height:78svh; }
          .hero-img { object-position:50% 20%; }
          .hero-inner { min-height:0; }
          .hero-box { margin-top:52svh; }
          h1 { font-size:clamp(2.25rem,9.5vw,4rem); }
          .about-grid, .contact-grid { grid-template-columns:1fr; }
          .step li { grid-template-columns:1fr; gap:2px; }
          .project { grid-template-columns:1fr; gap:14px; padding:22px 0 26px; }
          .project .shot { grid-column:1; grid-row:auto; }
          .contact-grid { gap:60px; }
          .footer { flex-direction:column; }
        }
        @media (max-width:520px) {
          .ledger td { font-size:1.25rem; }
          .ledger-lg td { font-size:1.9rem; }
        }
        @media (prefers-reduced-motion:reduce) { * { scroll-behavior:auto!important; transition:none!important; } }
      `}</style>

      <div className="progress" aria-hidden="true" />
      <TourRail chapters={chapters} />

      <header className="site-header page">
        <nav className="nav" aria-label="Main navigation">
          <div className="wordmark">Alexander Grant</div>
          <div className="nav-mid">Marketing and software for independent shops</div>
          <a href="#contact">Let’s talk</a>
        </nav>
      </header>

      <main id="content">
      <section className="hero">
        {heroImage()}
        <div className="hero-shade" aria-hidden="true" />
        <div className="page hero-inner">
          <div className="hero-box">
            <h1>I help independent shops sell more.</h1>
            <p className="hero-copy">I run your ads, search and email, and build the booking or store software when off-the-shelf tools get in the way. Every month you get a plain report on what it did to your sales.</p>
            <div className="hero-actions"><a className="button" href="#contact">Tell me about your business</a><a className="textlink" href="#about">Or take the tour</a></div>
            <HeroLedger tabs={heroTabs} />
          </div>
        </div>
      </section>

      <div className="page">
        <section className="about" id="about">
          <Folio name="Who I am" no="1" />
          <div className="about-grid">
            <div>
              <h2>One person for the marketing and the software.</h2>
              <p className="about-copy" style={{ marginTop: 22 }}>I’m Alex. I work from New York with a small number of independent businesses at a time: shops, studios and services that are too big for off-the-shelf tools and too small for an agency.</p>
              <p className="about-copy">I run the ads, search and email that bring customers in, and I build the booking, store and back-office software that keeps them. Both halves report to the same number: your sales.</p>
            </div>
            <div>
              {build && <Image className="photo" src={build.src} width={build.width} height={build.height} alt={build.alt} sizes="(max-width: 800px) 100vw, (min-width: 1440px) 560px, 40vw" />}
              <Ledger rows={[['Based in', 'New York'], ['Working with', 'Retail, studios, services'], ['Reports to clients', 'Monthly']]} />
            </div>
          </div>
          {band && <Image className="photo" src={band.src} width={band.width} height={band.height} alt={band.alt} sizes="(min-width: 1440px) 1350px, 100vw" />}
        </section>

        <section className="case" id="adventureline">
          <Folio name="Case one, Adventureline" no="2" />
          <div className="case-grid">
            <div className="case-media">
              <h2>Adventureline</h2>
              <p>Outdoor apparel on Shopify, Australia</p>
              <ProductVideo slug="adventureline" label="Adventureline" className="shot" />
              <blockquote className="quote">“Numbers are moving in the right direction which is great. Thanks again for steering us in the right direction!”<cite>Matt Browne, Owner</cite></blockquote>
            </div>
            <div className="steps">
              <Step kicker="Where they started" title="Ads that nobody could tie to sales.">
                <p>A well-loved outdoor brand with a Shopify store, spending on Google and Meta every month without a clear line from the spend to the orders. The owners wanted to spend less and sell more, and to understand which was which.</p>
              </Step>
              <Step kicker="What I run" title="Ads, search and email, reported monthly.">
                <p>I took over the Google and Meta accounts, rebuilt the campaigns around the products that actually sell, rewrote 22 collections and 57 products for search, and fixed the email automations that had been promising a discount code that didn’t exist. Once a month the owners get a one-page report in plain words: what we spent, what it brought in, what changes next.</p>
              </Step>
              <Step kicker="What changed" title="The biggest month in the brand’s history.">
                <p>June set a record. When the owners asked to spend less, I cut Google ad spend by 29% from June to July and each dollar of ads brought in more sales than before. Organic search position roughly halved year on year.</p>
                <Ledger rows={adventureline} large />
              </Step>
            </div>
          </div>
        </section>

        <section className="case case-end" id="playday">
          <Folio name="Case two, Playday" no="3" />
          <div className="case-grid">
            <div className="case-media">
              <h2>Playday</h2>
              <p>Children’s art studios, New York and Hoboken</p>
              <ProductVideo slug="playday" label="Playday" className="shot" />
              <blockquote className="quote">“Thanks so much for the incredible work you are putting into this.”<cite>Megan Smith, Director of Family Relations</cite></blockquote>
            </div>
            <div className="steps">
              <Step kicker="Where they started" title="Seven studios, one Wix site, and a lot done by hand.">
                <p>Classes, camps and birthday parties across seven studios, booked through forms and phone calls, paid in a mix of ways, and tracked by staff in spreadsheets. Every new studio meant more of the same work.</p>
              </Step>
              <Step kicker="What I built" title="One booking system, written for how the studios actually work.">
                <p>I replaced the Wix site with a platform I built for them. Families book and pay online. Staff run every studio from one admin.</p>
                <ul>
                  <li><b>Bookings</b><span>Classes, camps, birthday parties, class packs and memberships, with waitlists when a session fills</span></li>
                  <li><b>Payments</b><span>Square checkout, gift cards, promo codes, sibling discounts and recurring membership billing</span></li>
                  <li><b>Invoicing</b><span>Party deposits and final invoices, partner invoices, all tracked from enquiry to paid</span></li>
                  <li><b>Scheduling</b><span>One calendar across every studio, with teachers, capacity and check-in per session</span></li>
                </ul>
              </Step>
              <Step kicker="What runs on its own" title="The follow-up happens after the studio closes.">
                <p>Confirmation emails go out with a QR code for check-in. Text reminders go the day before, inside quiet hours. Review requests follow a first visit. Staff get an alert when a party enquiry or a waitlist spot needs a human. None of it waits for someone to remember.</p>
              </Step>
              <Step kicker="What changed" title="The new Tribeca studio opened on it and was full for its first weekend.">
                <p>Studios have moved onto it one by one since August, each one bringing its families across. Managers see takings per studio, bookings per class and who is coming tomorrow. Parents see their bookings, credits and receipts in one place.</p>
                <Ledger rows={playday} large />
              </Step>
            </div>
          </div>
        </section>

        <section className="services" id="services">
          <Folio name="How I work" no="4" />
          <div className="services-grid">
            <div className="services-text">
              <h2>Three things, judged by one number.</h2>
              <p>Everything I do for a client is measured in what shows up in the till. If a service doesn’t move that number, I’ll tell you, and we stop doing it.</p>
            </div>
            <ol className="offers" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {services.map(([title, body, slot], i) => { const img = photo(slot); return (
                <li className="offer" key={slot}>
                  <span className="offer-no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  {img && <Image className="photo" src={img.src} width={img.width} height={img.height} alt={img.alt} sizes="(max-width: 800px) 100vw, (min-width: 1440px) 700px, 50vw" />}
                  <h3>{title}</h3>
                  <p>{body}</p>
                </li>
              )})}
            </ol>
          </div>
        </section>

        <section className="builds" id="builds">
          <Folio name="More builds" no="5" />
          <h2>Other sites and apps I’ve built.</h2>
          <div className="work-list">{work.map(([name,desc,href,slug,site])=><div className="project" key={name}><h3 className="project-name"><a className="project-link" href={href} target="_blank" rel="noopener noreferrer">{name}<span className="sr-only"> (opens in a new tab)</span></a></h3><span><span className="project-desc">{desc}</span><span className="project-site" aria-hidden="true">{site}</span></span><ProductVideo slug={slug} label={name} className="shot" /></div>)}</div>
        </section>
      </div>

      <section className="contact" id="contact"><div className="contact-inner"><Folio name="Talk to me" no="6" /><div className="contact-grid"><div><h2>Tell me about your business.</h2><p className="contact-copy">Send me a message about what you sell and what isn’t working. I’ll take a look and tell you honestly whether I can help.</p><a className="email" href="mailto:alexandergrantapp@gmail.com">alexandergrantapp@gmail.com</a></div><div className="form-wrap"><WhatsAppForm /></div></div></div></section>
      </main>
      <footer><div className="footer"><span>Alexander Grant</span><span>New York, working internationally</span><a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Photography from Pexels<span className="sr-only"> (opens in a new tab)</span></a><span>© 2026</span></div></footer>
    </>
  )
}
