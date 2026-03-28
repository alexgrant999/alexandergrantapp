import { WhatsAppForm } from '@/components/WhatsAppForm'

export default function HomePage() {
  return (
    <>
      <style>{`
        :root {
          --bg: #f4efe5;
          --surface: #ede7dc;
          --border: #cec7b8;
          --text: #18150e;
          --muted: #857c70;
          --bronze: #9a6c1e;
          --bronze-light: rgba(154,108,30,.07);
          --card-bg: #f9f4eb;
          --accent: #9a6c1e;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: var(--bg);
          color: var(--text);
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          min-height: 100vh;
        }

        /* Paper grain overlay */
        body::before {
          content: '';
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 9999;
          opacity: .03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 200px;
        }

        /* Top bar */
        .topbar {
          background: var(--text);
          color: var(--bg);
          padding: 7px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .topbar-text {
          font-family: 'DM Mono', monospace;
          font-size: .58rem;
          letter-spacing: .18em;
          text-transform: uppercase;
          opacity: .5;
        }

        /* Hero */
        .hero {
          padding: 60px 28px 52px;
          text-align: center;
          border-bottom: 3px double var(--border);
          position: relative;
        }
        .hero-label {
          font-family: 'DM Mono', monospace;
          font-size: .6rem;
          letter-spacing: .24em;
          text-transform: uppercase;
          color: var(--bronze);
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
        }
        .hero-label::before, .hero-label::after {
          content: '';
          width: 48px;
          height: 1px;
          background: var(--bronze);
          opacity: .45;
        }
        .hero-name {
          font-family: 'Playfair Display SC', serif;
          font-size: clamp(2.8rem, 10.5vw, 8.8rem);
          font-weight: 700;
          line-height: .9;
          letter-spacing: -.025em;
          color: var(--text);
          margin-bottom: 36px;
        }
        .hero-name em {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          color: var(--bronze);
        }
        .hero-tagline {
          font-size: .98rem;
          color: var(--muted);
          max-width: 400px;
          margin: 0 auto 32px;
          line-height: 1.75;
        }
        .hero-badges {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .badge {
          font-family: 'DM Mono', monospace;
          font-size: .6rem;
          letter-spacing: .1em;
          text-transform: uppercase;
          padding: 4px 12px;
          border: 1px solid var(--border);
          color: var(--muted);
          background: transparent;
        }

        /* Container */
        .container { max-width: 1160px; margin: 0 auto; }

        /* Section */
        .section { padding: 60px 28px; }
        .section-header {
          display: flex;
          align-items: baseline;
          gap: 14px;
          margin-bottom: 40px;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--border);
        }
        .section-num {
          font-family: 'DM Mono', monospace;
          font-size: .58rem;
          letter-spacing: .16em;
          color: var(--bronze);
          opacity: .7;
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.7rem;
          font-weight: 700;
          font-style: italic;
          letter-spacing: -.02em;
          color: var(--text);
        }
        .section-count {
          font-family: 'DM Mono', monospace;
          font-size: .58rem;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--muted);
          margin-left: auto;
        }

        /* Grid */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        /* Card */
        .card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: border-color .25s, box-shadow .25s;
        }
        .card:hover {
          border-color: var(--bronze);
          box-shadow: 4px 6px 28px rgba(24,21,14,.1);
        }
        .card-screenshot {
          width: 100%;
          height: 176px;
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
        }
        .card-screenshot img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: top;
          display: block;
          transition: transform .5s cubic-bezier(.16,1,.3,1);
        }
        .card:hover .card-screenshot img { transform: scale(1.05); }
        .card-screenshot::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 50%, var(--card-bg) 100%);
        }
        .card-screenshot-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          background: var(--surface);
        }
        .card-body {
          padding: 8px 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex: 1;
        }
        .card-num {
          font-family: 'DM Mono', monospace;
          font-size: .56rem;
          letter-spacing: .16em;
          color: var(--bronze);
          opacity: .65;
        }
        .card-header { display: flex; align-items: flex-start; gap: 12px; }
        .card-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;
          border: 1px solid var(--border);
          background: var(--surface);
        }
        .card-meta { flex: 1; }
        .card-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.05rem;
          font-weight: 700;
          letter-spacing: -.01em;
          color: var(--text);
          margin-bottom: 2px;
          line-height: 1.3;
        }
        .card-type {
          font-family: 'DM Mono', monospace;
          font-size: .58rem;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: var(--muted);
        }
        .card-desc {
          font-size: .875rem;
          color: var(--muted);
          line-height: 1.7;
        }
        .tags { display: flex; gap: 5px; flex-wrap: wrap; }
        .tag {
          font-family: 'DM Mono', monospace;
          font-size: .56rem;
          letter-spacing: .06em;
          padding: 2px 8px;
          border: 1px solid var(--border);
          color: var(--muted);
          background: var(--surface);
        }
        .card-footer {
          display: flex;
          gap: 10px;
          margin-top: auto;
          align-items: center;
          padding-top: 14px;
          border-top: 1px solid var(--border);
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 14px;
          font-family: 'DM Mono', monospace;
          font-size: .62rem;
          letter-spacing: .1em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all .15s;
          cursor: pointer;
          border: none;
          font-weight: 500;
        }
        .btn-primary { background: var(--text); color: var(--bg); }
        .btn-primary:hover { background: var(--bronze); }
        .btn-ghost {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
        }
        .btn-ghost:hover { border-color: var(--bronze); color: var(--bronze); }
        .btn-disabled {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--border);
          cursor: default;
          pointer-events: none;
        }

        /* Status indicators */
        .status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: 'DM Mono', monospace;
          font-size: .58rem;
          letter-spacing: .1em;
          text-transform: uppercase;
        }
        .status-live { color: #3d8a55; }
        .status-dev { color: var(--bronze); }
        .status-mobile { color: #3a6ea0; }
        .pip { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        .pip-live { animation: pulse 2.5s infinite; }

        /* Contact */
        .contact-section { border-top: 3px double var(--border); }

        /* Divider */
        .divider { border: none; border-top: 1px solid var(--border); }

        /* Footer */
        footer {
          border-top: 1px solid var(--border);
          padding: 32px 28px;
        }
        .footer-inner {
          max-width: 1160px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .footer-name {
          font-family: 'Playfair Display SC', serif;
          font-size: .8rem;
          letter-spacing: .05em;
          color: var(--text);
        }
        .footer-info {
          font-family: 'DM Mono', monospace;
          font-size: .58rem;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .footer-info a { color: var(--bronze); text-decoration: none; }
        .footer-info a:hover { text-decoration: underline; }

        /* Fade-in animation */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .75s cubic-bezier(.16,1,.3,1) both; }
        .delay-1 { animation-delay: .1s; }
        .delay-2 { animation-delay: .22s; }
        .delay-3 { animation-delay: .38s; }

        @media (max-width: 640px) {
          .hero { padding: 44px 20px 38px; }
          .grid { grid-template-columns: 1fr; }
          .topbar-right { display: none; }
          .footer-inner { flex-direction: column; text-align: center; gap: 8px; }
          .section-count { display: none; }
          .section { padding: 48px 20px; }
        }
      `}</style>

      {/* Masthead bar */}
      <div className="topbar">
        <span className="topbar-text">Alexander Grant — Full-Stack Developer</span>
        <span className="topbar-text topbar-right">Sydney, Australia · Web & Mobile</span>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="hero-label fade-up">Portfolio</div>
        <h1 className="hero-name fade-up delay-1">
          Alexander<br /><em>Grant</em>
        </h1>
        <p className="hero-tagline fade-up delay-2">
          Full-stack developer building web &amp; mobile products across wellness, education, real estate and more.
        </p>
        <div className="hero-badges fade-up delay-3">
          <span className="badge">Next.js</span>
          <span className="badge">React</span>
          <span className="badge">Flutter</span>
          <span className="badge">Supabase</span>
          <span className="badge">TypeScript</span>
          <span className="badge">AI-Powered</span>
        </div>
      </section>

      {/* Projects */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-num">01</span>
            <h2 className="section-title">Selected Work</h2>
            <span className="section-count">8 Projects</span>
          </div>
          <div className="grid">

            <div className="card">
              <div className="card-screenshot"><img src="/screenshots/findyoga-au.jpg" alt="Find Yoga Australia" /></div>
              <div className="card-body">
                <div className="card-num">01 / 08</div>
                <div className="card-header">
                  <div className="card-icon">🧘</div>
                  <div className="card-meta">
                    <div className="card-name">Find Yoga Australia</div>
                    <div className="card-type">Yoga Directory &amp; Listings</div>
                  </div>
                </div>
                <p className="card-desc">Australia&apos;s yoga studio and class directory. Search by location, style, and level — connecting practitioners with teachers across the country.</p>
                <div className="tags">
                  <span className="tag">Node.js</span><span className="tag">Keystone.js</span><span className="tag">MongoDB</span><span className="tag">Heroku</span>
                </div>
                <div className="card-footer">
                  <span className="status status-live"><span className="pip pip-live"></span>Live</span>
                  <a href="https://findyoga.com.au" target="_blank" rel="noopener" className="btn btn-primary">Visit Site ↗</a>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-screenshot"><img src="/screenshots/balispirit.jpg" alt="Bali Spirit Festival" /></div>
              <div className="card-body">
                <div className="card-num">02 / 08</div>
                <div className="card-header">
                  <div className="card-icon">🌴</div>
                  <div className="card-meta">
                    <div className="card-name">Bali Spirit Festival</div>
                    <div className="card-type">Event Scheduling App</div>
                  </div>
                </div>
                <p className="card-desc">AI-powered festival scheduling app for Bali Spirit Festival. Browse sessions, build personalised schedules, and discover events — powered by Gemini AI and Supabase.</p>
                <div className="tags">
                  <span className="tag">React 19</span><span className="tag">Vite</span><span className="tag">Supabase</span><span className="tag">Gemini AI</span>
                </div>
                <div className="card-footer">
                  <span className="status status-live"><span className="pip pip-live"></span>Live</span>
                  <a href="https://bali-spirit.vercel.app/" target="_blank" rel="noopener" className="btn btn-primary">Visit Site ↗</a>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-screenshot"><img src="/screenshots/vibro-acoustic.jpg" alt="Vibro-Acoustic App" /></div>
              <div className="card-body">
                <div className="card-num">03 / 08</div>
                <div className="card-header">
                  <div className="card-icon">🎵</div>
                  <div className="card-meta">
                    <div className="card-name">Vibro-Acoustic App</div>
                    <div className="card-type">Sound Therapy Player</div>
                  </div>
                </div>
                <p className="card-desc">An immersive vibroacoustic therapy sound experience. Stream curated therapeutic audio sessions designed to promote deep relaxation and wellbeing.</p>
                <div className="tags">
                  <span className="tag">Next.js 15</span><span className="tag">React 19</span><span className="tag">Web Audio API</span>
                </div>
                <div className="card-footer">
                  <span className="status status-live"><span className="pip pip-live"></span>Live</span>
                  <a href="https://vibroapp.vercel.app" target="_blank" rel="noopener" className="btn btn-primary">Visit Site ↗</a>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-screenshot"><img src="/screenshots/tcm-study.jpg" alt="TCM Study" /></div>
              <div className="card-body">
                <div className="card-num">04 / 08</div>
                <div className="card-header">
                  <div className="card-icon">📚</div>
                  <div className="card-meta">
                    <div className="card-name">TCM Study</div>
                    <div className="card-type">Adaptive Learning Platform</div>
                  </div>
                </div>
                <p className="card-desc">Traditional Chinese Medicine exam prep with spaced repetition, flashcards, case studies, and an adaptive learning engine that adjusts to your knowledge gaps.</p>
                <div className="tags">
                  <span className="tag">Next.js 14</span><span className="tag">Supabase</span><span className="tag">TanStack Query</span><span className="tag">Recharts</span>
                </div>
                <div className="card-footer">
                  <span className="status status-live"><span className="pip pip-live"></span>Live</span>
                  <a href="https://tcm-study.vercel.app" target="_blank" rel="noopener" className="btn btn-primary">Visit Site ↗</a>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-screenshot"><img src="/screenshots/real-estate.jpg" alt="Real Estate Dashboard" /></div>
              <div className="card-body">
                <div className="card-num">05 / 08</div>
                <div className="card-header">
                  <div className="card-icon">🏠</div>
                  <div className="card-meta">
                    <div className="card-name">Real Estate Dashboard</div>
                    <div className="card-type">Market Analysis Tool</div>
                  </div>
                </div>
                <p className="card-desc">Data-driven real estate analysis dashboard. Visualise market trends, compare suburbs, and surface insights from property data using interactive charts.</p>
                <div className="tags">
                  <span className="tag">Next.js 14</span><span className="tag">Recharts</span><span className="tag">SQLite</span><span className="tag">Tailwind</span>
                </div>
                <div className="card-footer">
                  <span className="status status-live"><span className="pip pip-live"></span>Live</span>
                  <a href="https://real-estate-steel-three.vercel.app" target="_blank" rel="noopener" className="btn btn-primary">Visit Site ↗</a>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-screenshot"><img src="/screenshots/iemerge-appstore.jpg" alt="iEmerge" /></div>
              <div className="card-body">
                <div className="card-num">06 / 08</div>
                <div className="card-header">
                  <div className="card-icon">🌱</div>
                  <div className="card-meta">
                    <div className="card-name">iEmerge</div>
                    <div className="card-type">Wellness Platform</div>
                  </div>
                </div>
                <p className="card-desc">A wellness platform blending Spotify playlist generation via OpenAI with guided meditation, breathing exercises, and mindfulness content via a Flutter mobile app.</p>
                <div className="tags">
                  <span className="tag">Next.js 14</span><span className="tag">OpenAI</span><span className="tag">Spotify API</span><span className="tag">Flutter</span><span className="tag">Firebase</span>
                </div>
                <div className="card-footer">
                  <span className="status status-mobile"><span className="pip"></span>App Store</span>
                  <a href="https://apps.apple.com/pl/app/iemerge-app/id6503445578" target="_blank" rel="noopener" className="btn btn-primary">Download ↗</a>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-screenshot" style={{ background: 'linear-gradient(135deg,#ede7dc,#e0d9ce)' }}>
                <div className="card-screenshot-placeholder">🎧</div>
              </div>
              <div className="card-body">
                <div className="card-num">07 / 08</div>
                <div className="card-header">
                  <div className="card-icon">🎧</div>
                  <div className="card-meta">
                    <div className="card-name">Orphius</div>
                    <div className="card-type">Mobile Audio App</div>
                  </div>
                </div>
                <p className="card-desc">A Flutter meditation and audio app featuring YouTube integration, an RSS podcast feed reader, and a Supabase backend with Firebase auth for a smooth mobile experience.</p>
                <div className="tags">
                  <span className="tag">Flutter</span><span className="tag">Supabase</span><span className="tag">Firebase</span><span className="tag">YouTube API</span>
                </div>
                <div className="card-footer">
                  <span className="status status-mobile"><span className="pip"></span>App Store</span>
                  <a href="https://apps.apple.com/us/app/orpheusb/id6502888343" target="_blank" rel="noopener" className="btn btn-primary">Download ↗</a>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-screenshot"><img src="/screenshots/playday.jpg" alt="Playday" /></div>
              <div className="card-body">
                <div className="card-num">08 / 08</div>
                <div className="card-header">
                  <div className="card-icon">🎉</div>
                  <div className="card-meta">
                    <div className="card-name">Playday</div>
                    <div className="card-type">Children&apos;s Activity Booking</div>
                  </div>
                </div>
                <p className="card-desc">Multi-location booking platform for children&apos;s activities. Features parent and admin portals, Stripe memberships, class scheduling, and capacity management.</p>
                <div className="tags">
                  <span className="tag">Next.js 15</span><span className="tag">Supabase</span><span className="tag">Stripe</span><span className="tag">Tailwind</span>
                </div>
                <div className="card-footer">
                  <span className="status status-dev"><span className="pip"></span>In Dev</span>
                  <span className="btn btn-disabled">Coming Soon</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* Contact */}
      <section className="section contact-section">
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="section-header">
            <span className="section-num">02</span>
            <h2 className="section-title">Get in Touch</h2>
          </div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '.7rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 28 }}>
            Send a message on WhatsApp
          </p>
          <WhatsAppForm />
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <span className="footer-name">Alexander Grant</span>
          <span className="footer-info">Full-stack developer &mdash; Sydney, Australia</span>
          <span className="footer-info">
            <a href="mailto:alex@alexandergrant.app">alex@alexandergrant.app</a>
          </span>
        </div>
      </footer>
    </>
  )
}
