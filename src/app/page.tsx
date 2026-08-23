import { WhatsAppForm } from '@/components/WhatsAppForm'

export default function HomePage() {
  return (
    <>
      <style>{`
        :root {
          --paper: oklch(0.972 0.009 80);
          --paper-deep: oklch(0.945 0.014 78);
          --ink: oklch(0.26 0.022 55);
          --ink-soft: oklch(0.45 0.02 55);
          --accent: oklch(0.55 0.135 55);
          --accent-deep: oklch(0.46 0.12 50);
          --rule: oklch(0.87 0.02 75);
          --card-bg: oklch(0.99 0.005 85);
          --border: var(--rule);
          --text: var(--ink);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: var(--paper);
          color: var(--ink);
          font-family: 'Hanken Grotesk', system-ui, sans-serif;
          line-height: 1.6;
          min-height: 100vh;
        }
        ::selection { background: var(--accent); color: var(--paper); }

        .shell { max-width: 1080px; margin: 0 auto; padding: 0 clamp(20px, 5vw, 48px); }

        /* Header */
        .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: clamp(20px, 3vw, 32px);
          font-size: .9rem;
        }
        .top-name { font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-weight: 800; letter-spacing: -.02em; font-size: 1.05rem; }
        .top a { color: var(--ink); text-decoration: none; font-weight: 600; }
        .top a:hover { color: var(--accent-deep); }

        /* Hero */
        .hero { padding: clamp(64px, 11vw, 130px) 0 clamp(48px, 7vw, 88px); }
        .hero-kicker {
          font-size: .95rem;
          font-weight: 600;
          color: var(--accent-deep);
          margin-bottom: 22px;
        }
        .hero h1 {
          font-family: 'Bricolage Grotesque', system-ui, sans-serif;
          font-size: clamp(2.6rem, 6.5vw, 4.6rem);
          font-weight: 800;
          line-height: 1.04;
          letter-spacing: -.035em;
          max-width: 15ch;
          margin-bottom: 28px;
        }
        .hero h1 em { font-style: normal; color: var(--accent); }
        .hero-sub {
          font-size: clamp(1.05rem, 1.6vw, 1.25rem);
          color: var(--ink-soft);
          max-width: 52ch;
          line-height: 1.65;
          margin-bottom: 38px;
        }
        .hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 999px;
          font-size: 1rem;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          border: none;
          transition: transform .18s cubic-bezier(.22,1,.36,1), background .18s;
        }
        .btn-primary { background: var(--ink); color: var(--paper); }
        .btn-primary:hover { background: var(--accent-deep); transform: translateY(-1px); }
        .btn-quiet { background: transparent; color: var(--ink); border: 1.5px solid var(--rule); }
        .btn-quiet:hover { border-color: var(--accent); color: var(--accent-deep); }

        /* Section scaffolding */
        .section { padding: clamp(56px, 8vw, 104px) 0; }
        .section-rule { border: none; border-top: 1px solid var(--rule); }
        .eyebrow {
          font-size: .85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .14em;
          color: var(--accent-deep);
          margin-bottom: 14px;
        }
        .section-lede {
          font-family: 'Bricolage Grotesque', system-ui, sans-serif;
          font-size: clamp(1.6rem, 3.4vw, 2.4rem);
          font-weight: 700;
          letter-spacing: -.03em;
          line-height: 1.15;
          max-width: 24ch;
          margin-bottom: clamp(36px, 5vw, 64px);
        }

        /* Case studies */
        .case { display: grid; grid-template-columns: 5fr 7fr; gap: clamp(28px, 5vw, 72px); align-items: start; }
        .case + .case { margin-top: clamp(56px, 8vw, 96px); padding-top: clamp(56px, 8vw, 96px); border-top: 1px solid var(--rule); }
        .case-brand {
          font-family: 'Bricolage Grotesque', system-ui, sans-serif;
          font-size: clamp(1.7rem, 3vw, 2.3rem);
          font-weight: 800;
          letter-spacing: -.02em;
          line-height: 1.05;
        }
        .case-what { color: var(--ink-soft); font-size: 1rem; margin-top: 8px; }
        .case-quote { margin-top: clamp(24px, 3vw, 40px); max-width: 34ch; }
        .case-quote .mark {
          display: block;
          font-family: 'Bricolage Grotesque', serif;
          font-size: 3rem;
          font-weight: 800;
          line-height: .5;
          color: var(--accent);
          margin-bottom: 14px;
        }
        .case-quote p { font-size: 1.08rem; line-height: 1.6; font-weight: 500; }
        .case-quote cite { display: block; font-style: normal; color: var(--ink-soft); font-size: .9rem; margin-top: 12px; }
        .case-copy { font-size: 1.05rem; line-height: 1.7; color: var(--ink-soft); max-width: 58ch; }
        .case-copy strong { color: var(--ink); font-weight: 700; }
        .numbers {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(18px, 3vw, 36px);
          margin-top: clamp(28px, 4vw, 44px);
        }
        .num { border-top: 2px solid var(--ink); padding-top: 14px; }
        .num b {
          display: block;
          font-family: 'Bricolage Grotesque', system-ui, sans-serif;
          font-size: clamp(2rem, 4.2vw, 3.2rem);
          font-weight: 800;
          letter-spacing: -.03em;
          line-height: 1;
          color: var(--accent);
        }
        .num span { display: block; font-size: .92rem; color: var(--ink-soft); margin-top: 8px; line-height: 1.45; }

        /* Services */
        .services { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(28px, 4vw, 56px); }
        .service-n {
          font-family: 'Bricolage Grotesque', system-ui, sans-serif;
          font-weight: 800;
          font-size: 1rem;
          color: var(--accent);
          margin-bottom: 12px;
        }
        .service h3 {
          font-family: 'Bricolage Grotesque', system-ui, sans-serif;
          font-size: 1.35rem;
          font-weight: 700;
          letter-spacing: -.02em;
          margin-bottom: 10px;
        }
        .service p { color: var(--ink-soft); font-size: 1rem; line-height: 1.65; max-width: 34ch; }

        /* Work */
        .work-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: clamp(20px, 3vw, 32px); }
        .work { text-decoration: none; color: var(--ink); display: block; }
        .work-img {
          aspect-ratio: 16 / 10;
          overflow: hidden;
          border-radius: 12px;
          background: var(--paper-deep);
          border: 1px solid var(--rule);
        }
        .work-img img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: top;
          display: block;
          transition: transform .5s cubic-bezier(.22,1,.36,1);
        }
        .work:hover .work-img img { transform: scale(1.03); }
        .work h3 { font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-size: 1.08rem; font-weight: 700; letter-spacing: -.015em; margin: 14px 0 2px; }
        .work:hover h3 { color: var(--accent-deep); }
        .work p { color: var(--ink-soft); font-size: .94rem; }

        /* Contact */
        .contact-band { background: var(--accent); color: var(--ink); }
        .contact-band .shell { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(32px, 5vw, 72px); padding-top: clamp(56px, 8vw, 96px); padding-bottom: clamp(56px, 8vw, 96px); align-items: start; }
        .contact-band h2 {
          font-family: 'Bricolage Grotesque', system-ui, sans-serif;
          font-size: clamp(2rem, 4.5vw, 3.2rem);
          font-weight: 800;
          letter-spacing: -.03em;
          line-height: 1.08;
          color: oklch(0.99 0.01 85);
          max-width: 15ch;
        }
        .contact-band .contact-sub { margin-top: 18px; font-size: 1.1rem; line-height: 1.6; color: oklch(0.97 0.02 80); max-width: 40ch; }
        .contact-band .contact-alt { margin-top: 26px; font-size: .98rem; color: oklch(0.95 0.03 78); }
        .contact-band .contact-alt a { color: oklch(0.99 0.01 85); font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
        .contact-form {
          --card-bg: oklch(0.99 0.005 85);
          --border: transparent;
          --text: var(--ink);
          --accent: var(--ink);
        }

        /* Footer */
        footer { padding: 32px 0; }
        .footer-inner { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; font-size: .92rem; color: var(--ink-soft); }
        .footer-inner strong { font-family: 'Bricolage Grotesque', system-ui, sans-serif; color: var(--ink); font-weight: 700; }
        .footer-inner a { color: var(--ink-soft); text-decoration: none; }
        .footer-inner a:hover { color: var(--accent-deep); }

        /* Motion */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .7s cubic-bezier(.22,1,.36,1) both; }
        .d1 { animation-delay: .07s; }
        .d2 { animation-delay: .16s; }
        .d3 { animation-delay: .26s; }
        @media (prefers-reduced-motion: reduce) {
          .fade-up { animation: none; }
          html { scroll-behavior: auto; }
        }

        @media (max-width: 860px) {
          .case { grid-template-columns: 1fr; }
          .services { grid-template-columns: 1fr; gap: 32px; }
          .contact-band .shell { grid-template-columns: 1fr; }
          .numbers { grid-template-columns: repeat(3, 1fr); gap: 14px; }
          .num b { font-size: 1.7rem; }
        }
        @media (max-width: 520px) {
          .numbers { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="shell">
        <header className="top">
          <span className="top-name">Alexander Grant</span>
          <a href="#contact">Get in touch</a>
        </header>

        {/* Hero */}
        <section className="hero">
          <p className="hero-kicker fade-up">Growth partner for independent retailers</p>
          <h1 className="fade-up d1">I help online stores <em>sell more.</em></h1>
          <p className="hero-sub fade-up d2">
            Paid advertising, SEO, email, and custom-built platforms for independent brands in Australia and the US. Measured the only way that matters: your revenue against last year.
          </p>
          <div className="hero-ctas fade-up d3">
            <a href="#contact" className="btn btn-primary">Start a conversation</a>
            <a href="#results" className="btn btn-quiet">See the results</a>
          </div>
        </section>
      </div>

      <hr className="section-rule" />

      {/* Results */}
      <div className="shell" id="results">
        <section className="section">
          <p className="eyebrow">Client results</p>
          <h2 className="section-lede">Real stores, real numbers, reported to the owners every month.</h2>

          <article className="case">
            <div>
              <h3 className="case-brand">Adventureline</h3>
              <p className="case-what">Outdoor apparel on Shopify, Australia</p>
              <blockquote className="case-quote">
                <span className="mark">&ldquo;</span>
                <p>Numbers are moving in the right direction which is great. Thanks again for the help in steering us in the right direction!</p>
                <cite>Matt Browne, Owner</cite>
              </blockquote>
            </div>
            <div>
              <p className="case-copy">
                I run Adventureline&apos;s Google and Meta advertising, SEO, and email automation as an ongoing partner. <strong>June was the biggest month in the brand&apos;s history, and July was the biggest July ever.</strong> When the owners asked to bring costs down, I cut ad spend 29% and the return per dollar improved.
              </p>
              <div className="numbers">
                <div className="num"><b>+69%</b><span>July sales, year on year</span></div>
                <div className="num"><b>+84%</b><span>July orders, year on year</span></div>
                <div className="num"><b>+34%</b><span>Winter season sales vs last year</span></div>
              </div>
            </div>
          </article>

          <article className="case">
            <div>
              <h3 className="case-brand">Playday</h3>
              <p className="case-what">Children&apos;s art studios, New York City</p>
              <blockquote className="case-quote">
                <span className="mark">&ldquo;</span>
                <p>Thanks so much for the incredible work you are putting into this.</p>
                <cite>Megan Smith, Director of Family Relations</cite>
              </blockquote>
            </div>
            <div>
              <p className="case-copy">
                I built Playday&apos;s booking platform from scratch to replace Wix: class bookings, payments, family messaging, and marketing automation. <strong>Their new Tribeca studio launched on it and filled its opening weekend.</strong> I also run their advertising and email.
              </p>
              <div className="numbers">
                <div className="num"><b>35</b><span>Families booked in the opening weekend</span></div>
                <div className="num"><b>50</b><span>Kids through the platform in two days</span></div>
                <div className="num"><b>5.0</b><span>Feedback from the first families</span></div>
              </div>
            </div>
          </article>
        </section>
      </div>

      <hr className="section-rule" />

      {/* Services */}
      <div className="shell">
        <section className="section">
          <p className="eyebrow">How I help</p>
          <h2 className="section-lede">One person across your marketing and your technology.</h2>
          <div className="services">
            <div className="service">
              <p className="service-n">01</p>
              <h3>Growth marketing</h3>
              <p>Google and Meta ads, SEO, and email campaigns that pay for themselves. You see the numbers against last year, every month.</p>
            </div>
            <div className="service">
              <p className="service-n">02</p>
              <h3>Custom platforms</h3>
              <p>Bookings, ecommerce, and customer portals built around how your business actually runs, when off-the-shelf tools hold you back.</p>
            </div>
            <div className="service">
              <p className="service-n">03</p>
              <h3>Automation</h3>
              <p>Welcome series, review requests, abandoned carts, SMS. The follow-up that happens on its own while you run the shop.</p>
            </div>
          </div>
        </section>
      </div>

      <hr className="section-rule" />

      {/* Work */}
      <div className="shell">
        <section className="section">
          <p className="eyebrow">Selected work</p>
          <h2 className="section-lede">Platforms I&apos;ve designed, built, and shipped.</h2>
          <div className="work-grid">
            <a className="work" href="https://findyoga.com.au" target="_blank" rel="noopener">
              <div className="work-img"><img src="/screenshots/findyoga-au.jpg" alt="Find Yoga Australia, the national yoga studio directory" /></div>
              <h3>Find Yoga Australia</h3>
              <p>Australia&apos;s yoga studio and class directory</p>
            </a>
            <a className="work" href="https://tribeca.playday.com" target="_blank" rel="noopener">
              <div className="work-img"><img src="/screenshots/playday.jpg" alt="Playday, booking platform for children's activity studios" /></div>
              <h3>Playday</h3>
              <p>Multi-location booking platform for children&apos;s studios</p>
            </a>
            <a className="work" href="https://bali-spirit.vercel.app/" target="_blank" rel="noopener">
              <div className="work-img"><img src="/screenshots/balispirit.jpg" alt="Bali Spirit Festival schedule app" /></div>
              <h3>Bali Spirit Festival</h3>
              <p>Festival schedule app used by thousands of attendees</p>
            </a>
            <a className="work" href="https://sewing-class.vercel.app" target="_blank" rel="noopener">
              <div className="work-img"><img src="/screenshots/sewing-class.jpg" alt="TRNZK sewing school booking system" /></div>
              <h3>TRNZK Sewing Classes</h3>
              <p>Term bookings, deposits, and payments for a sewing school</p>
            </a>
            <a className="work" href="https://tcm-study.vercel.app" target="_blank" rel="noopener">
              <div className="work-img"><img src="/screenshots/tcm-study.jpg" alt="TCM Study exam preparation platform" /></div>
              <h3>TCM Study</h3>
              <p>Exam prep platform with adaptive learning</p>
            </a>
            <a className="work" href="https://apps.apple.com/pl/app/iemerge-app/id6503445578" target="_blank" rel="noopener">
              <div className="work-img"><img src="/screenshots/iemerge-appstore.jpg" alt="iEmerge wellness app on the App Store" /></div>
              <h3>iEmerge</h3>
              <p>Wellness app on the iOS App Store</p>
            </a>
          </div>
        </section>
      </div>

      {/* Contact */}
      <div className="contact-band" id="contact">
        <div className="shell">
          <div>
            <h2>Think your store could be doing better?</h2>
            <p className="contact-sub">Tell me about it. I&apos;ll take a look and give you a straight answer on where the growth is.</p>
            <p className="contact-alt">Prefer email? <a href="mailto:alexandergrantapp@gmail.com">alexandergrantapp@gmail.com</a></p>
          </div>
          <div className="contact-form">
            <WhatsAppForm />
          </div>
        </div>
      </div>

      <footer>
        <div className="shell footer-inner">
          <strong>Alexander Grant</strong>
          <span>Sydney, Australia</span>
          <a href="mailto:alexandergrantapp@gmail.com">alexandergrantapp@gmail.com</a>
        </div>
      </footer>
    </>
  )
}
