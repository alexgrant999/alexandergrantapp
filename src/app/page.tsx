import { WhatsAppForm } from '@/components/WhatsAppForm'

export default function HomePage() {
  return (
    <>
      <style>{`
        :root {
          --bg: #0a0a0a;
          --surface: #111111;
          --border: #1f1f1f;
          --accent: #f59e0b;
          --accent-dim: rgba(245,158,11,.1);
          --text: #f0f0f0;
          --muted: #666;
          --card-bg: #0e0e0e;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          background: var(--bg);
          color: var(--text);
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          min-height: 100vh;
        }

        /* Hero */
        .hero {
          padding: 96px 40px 80px;
          max-width: 1160px;
          margin: 0 auto;
        }
        .hero-kicker {
          font-family: 'DM Mono', monospace;
          font-size: .65rem;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 28px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .hero-kicker::before {
          content: '';
          width: 28px;
          height: 1px;
          background: var(--accent);
        }
        .hero-name {
          font-family: 'Bricolage Grotesque', system-ui, sans-serif;
          font-size: clamp(3.2rem, 9vw, 7.5rem);
          font-weight: 800;
          line-height: .93;
          letter-spacing: -.04em;
          color: var(--text);
          margin-bottom: 36px;
        }
        .hero-name span { color: var(--accent); }
        .hero-sub {
          font-size: 1.05rem;
          color: var(--muted);
          max-width: 480px;
          line-height: 1.75;
          margin-bottom: 40px;
        }
        .hero-badges {
          display: flex;
          gap: 7px;
          flex-wrap: wrap;
        }
        .badge {
          font-family: 'DM Mono', monospace;
          font-size: .62rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: 5px 12px;
          border: 1px solid var(--border);
          color: var(--muted);
          transition: border-color .2s, color .2s;
        }
        .badge:hover { border-color: var(--accent); color: var(--accent); }

        /* Divider */
        .divider {
          border: none;
          border-top: 1px solid var(--border);
          margin: 0 40px;
        }

        /* Section */
        .section { padding: 72px 40px; max-width: 1160px; margin: 0 auto; }
        .section-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 48px;
        }
        .section-title {
          font-family: 'Bricolage Grotesque', system-ui, sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -.025em;
        }
        .section-meta {
          font-family: 'DM Mono', monospace;
          font-size: .6rem;
          letter-spacing: .14em;
          text-transform: uppercase;
          color: var(--muted);
        }

        /* Grid */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 16px;
        }

        /* Card */
        .card {
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: border-color .25s;
        }
        .card:hover { border-color: rgba(245,158,11,.35); }
        .card-screenshot {
          width: 100%;
          height: 172px;
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
          filter: grayscale(40%) brightness(.9);
          transition: filter .4s ease, transform .4s cubic-bezier(.16,1,.3,1);
        }
        .card:hover .card-screenshot img {
          filter: grayscale(0%) brightness(1);
          transform: scale(1.04);
        }
        .card-screenshot::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 72px;
          background: linear-gradient(to bottom, transparent, var(--card-bg));
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
          padding: 20px 22px 22px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }
        .card-header { display: flex; align-items: flex-start; gap: 12px; }
        .card-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
          background: var(--surface);
          border: 1px solid var(--border);
        }
        .card-meta { flex: 1; min-width: 0; }
        .card-name {
          font-family: 'Bricolage Grotesque', system-ui, sans-serif;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -.02em;
          color: var(--text);
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .card-type {
          font-family: 'DM Mono', monospace;
          font-size: .58rem;
          text-transform: uppercase;
          letter-spacing: .1em;
          color: var(--muted);
        }
        .card-desc {
          font-size: .865rem;
          color: var(--muted);
          line-height: 1.65;
        }
        .tags { display: flex; gap: 5px; flex-wrap: wrap; }
        .tag {
          font-family: 'DM Mono', monospace;
          font-size: .57rem;
          letter-spacing: .05em;
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid var(--border);
          color: #444;
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
          border-radius: 6px;
          font-family: 'DM Mono', monospace;
          font-size: .63rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          text-decoration: none;
          font-weight: 500;
          transition: all .15s;
          cursor: pointer;
          border: none;
        }
        .btn-primary { background: var(--accent); color: #0a0a0a; }
        .btn-primary:hover { background: #fbbf24; }
        .btn-ghost {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted);
        }
        .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
        .btn-disabled {
          background: transparent;
          border: 1px solid var(--border);
          color: #2a2a2a;
          cursor: default;
          pointer-events: none;
        }

        /* Status */
        .status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: 'DM Mono', monospace;
          font-size: .59rem;
          letter-spacing: .1em;
          text-transform: uppercase;
        }
        .status-live { color: #4ade80; }
        .status-dev { color: var(--accent); }
        .status-mobile { color: #60a5fa; }
        .pip { width: 5px; height: 5px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
        .pip-live { animation: pulse 2.5s infinite; }

        /* Contact */
        .contact-wrap { max-width: 520px; }

        /* Footer */
        footer {
          border-top: 1px solid var(--border);
          padding: 36px 40px;
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
          font-family: 'Bricolage Grotesque', system-ui, sans-serif;
          font-size: .9rem;
          font-weight: 700;
          letter-spacing: -.02em;
          color: var(--text);
        }
        .footer-meta {
          font-family: 'DM Mono', monospace;
          font-size: .6rem;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .footer-meta a { color: var(--accent); text-decoration: none; }
        .footer-meta a:hover { text-decoration: underline; }

        /* Fade animation */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .7s cubic-bezier(.16,1,.3,1) both; }
        .d1 { animation-delay: .08s; }
        .d2 { animation-delay: .18s; }
        .d3 { animation-delay: .3s; }

        @media (max-width: 768px) {
          .hero { padding: 64px 24px 56px; }
          .divider { margin: 0 24px; }
          .section { padding: 56px 24px; }
          .grid { grid-template-columns: 1fr; }
          footer { padding: 32px 24px; }
          .footer-inner { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}</style>

      {/* Hero */}
      <section className="hero">
        <p className="hero-kicker fade-up">Portfolio</p>
        <h1 className="hero-name fade-up d1">
          Alexander<br /><span>Grant</span>
        </h1>
        <p className="hero-sub fade-up d2">
          Full-stack developer building web &amp; mobile products across wellness, education, real estate and more.
        </p>
        <div className="hero-badges fade-up d3">
          <span className="badge">Next.js</span>
          <span className="badge">React</span>
          <span className="badge">Flutter</span>
          <span className="badge">Supabase</span>
          <span className="badge">TypeScript</span>
          <span className="badge">AI-Powered</span>
        </div>
      </section>

      <hr className="divider" />

      {/* Projects */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Projects</h2>
          <span className="section-meta">9 selected works</span>
        </div>
        <div className="grid">

          <div className="card">
            <div className="card-screenshot"><img src="/screenshots/findyoga-au.jpg" alt="Find Yoga Australia" /></div>
            <div className="card-body">
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
              <div className="card-header">
                <div className="card-icon">🌴</div>
                <div className="card-meta">
                  <div className="card-name">Bali Spirit Festival</div>
                  <div className="card-type">Event Scheduling App</div>
                </div>
              </div>
              <p className="card-desc">AI-powered festival scheduling app. Browse sessions, build personalised schedules, and discover events — powered by Gemini AI and Supabase.</p>
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
            <div className="card-screenshot"><img src="/screenshots/sewing-class.jpg" alt="TRNZK Sewing Classes" /></div>
            <div className="card-body">
              <div className="card-header">
                <div className="card-icon">🧵</div>
                <div className="card-meta">
                  <div className="card-name">TRNZK Sewing Classes</div>
                  <div className="card-type">Class Booking System</div>
                </div>
              </div>
              <p className="card-desc">Term-based sewing school booking platform. Stripe checkout with deposits, per-class capacity tracking, and an admin dashboard for managing bookings and revenue.</p>
              <div className="tags">
                <span className="tag">Next.js 15</span><span className="tag">Prisma</span><span className="tag">Stripe</span><span className="tag">PostgreSQL</span>
              </div>
              <div className="card-footer">
                <span className="status status-live"><span className="pip pip-live"></span>Live</span>
                <a href="https://sewing-class.vercel.app" target="_blank" rel="noopener" className="btn btn-primary">Visit Site ↗</a>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-screenshot"><img src="/screenshots/iemerge-appstore.jpg" alt="iEmerge" /></div>
            <div className="card-body">
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
            <div className="card-screenshot" style={{ background: 'linear-gradient(135deg,#0d0d1a,#141428)' }}>
              <div className="card-screenshot-placeholder">🎧</div>
            </div>
            <div className="card-body">
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
      </section>

      <hr className="divider" />

      {/* Contact */}
      <section className="section">
        <div className="section-header">
          <h2 className="section-title">Get in Touch</h2>
        </div>
        <div className="contact-wrap">
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: '.65rem', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 24 }}>
            Send a message on WhatsApp
          </p>
          <WhatsAppForm />
        </div>
      </section>

      <footer>
        <div className="footer-inner">
          <span className="footer-name">Alexander Grant</span>
          <span className="footer-meta">Full-stack developer — Sydney, Australia</span>
          <span className="footer-meta"><a href="mailto:alex@alexandergrant.app">alex@alexandergrant.app</a></span>
        </div>
      </footer>
    </>
  )
}
