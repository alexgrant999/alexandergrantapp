import { WhatsAppForm } from '@/components/WhatsAppForm'

export default function HomePage() {
  return (
    <>
      <style>{`
        :root {
          --bg: #0a0a0f;
          --surface: #13131a;
          --border: #1e1e2e;
          --accent: #6c63ff;
          --accent2: #ff6584;
          --text: #e8e8f0;
          --muted: #6b6b8a;
          --card-bg: #16161f;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; line-height: 1.6; min-height: 100vh; }
        .hero { position: relative; padding: 100px 24px 80px; text-align: center; overflow: hidden; }
        .hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(108,99,255,.18) 0%, transparent 70%); pointer-events: none; }
        .avatar { width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent2)); display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 700; margin: 0 auto 24px; box-shadow: 0 0 0 4px rgba(108,99,255,.25); }
        h1 { font-size: clamp(2rem, 5vw, 3.2rem); font-weight: 700; letter-spacing: -0.03em; margin-bottom: 12px; }
        h1 span { color: var(--accent); }
        .tagline { color: var(--muted); font-size: 1.1rem; max-width: 480px; margin: 0 auto 32px; }
        .hero-badges { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
        .badge { background: var(--border); border: 1px solid rgba(108,99,255,.3); color: var(--muted); font-size: .75rem; padding: 4px 12px; border-radius: 999px; letter-spacing: .04em; text-transform: uppercase; }
        .section { padding: 64px 24px; }
        .section-title { font-size: 1.6rem; font-weight: 700; letter-spacing: -.02em; margin-bottom: 8px; }
        .section-sub { color: var(--muted); font-size: .95rem; margin-bottom: 40px; }
        .container { max-width: 1120px; margin: 0 auto; }
        .divider { border: none; border-top: 1px solid var(--border); }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
        .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 28px; display: flex; flex-direction: column; gap: 16px; transition: transform .2s, border-color .2s, box-shadow .2s; position: relative; overflow: hidden; }
        .card-screenshot { width: calc(100% + 56px); margin: -28px -28px 0; height: 180px; overflow: hidden; border-radius: 16px 16px 0 0; position: relative; flex-shrink: 0; }
        .card-screenshot img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
        .card-screenshot-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; }
        .card-screenshot::after { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 60%, var(--card-bg) 100%); }
        .card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--card-accent, linear-gradient(90deg, var(--accent), var(--accent2))); border-radius: 16px 16px 0 0; z-index: 1; }
        .card:hover { transform: translateY(-4px); border-color: rgba(108,99,255,.4); box-shadow: 0 20px 40px rgba(0,0,0,.4); }
        .card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; flex-shrink: 0; }
        .card-header { display: flex; align-items: flex-start; gap: 14px; }
        .card-meta { flex: 1; }
        .card-name { font-size: 1.1rem; font-weight: 700; letter-spacing: -.01em; margin-bottom: 4px; }
        .card-type { font-size: .78rem; color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
        .card-desc { font-size: .9rem; color: var(--muted); line-height: 1.6; }
        .tags { display: flex; gap: 6px; flex-wrap: wrap; }
        .tag { background: rgba(108,99,255,.12); color: rgba(180,175,255,.8); font-size: .72rem; padding: 3px 10px; border-radius: 6px; font-weight: 500; }
        .card-footer { display: flex; gap: 10px; margin-top: auto; }
        .btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: .82rem; font-weight: 600; text-decoration: none; transition: background .15s, opacity .15s; cursor: pointer; border: none; }
        .btn-primary { background: var(--accent); color: #fff; }
        .btn-primary:hover { background: #5a52e0; }
        .btn-ghost { background: var(--border); color: var(--muted); }
        .btn-ghost:hover { background: #252535; color: var(--text); }
        .btn-disabled { background: var(--border); color: #3a3a55; cursor: default; pointer-events: none; }
        .status { display: inline-flex; align-items: center; gap: 5px; font-size: .75rem; padding: 3px 10px; border-radius: 999px; }
        .status-live { background: rgba(34,197,94,.12); color: #4ade80; }
        .status-dev { background: rgba(251,191,36,.1); color: #fbbf24; }
        .status-mobile { background: rgba(99,179,255,.12); color: #63b3ff; }
        .pip { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
        .pip-live { animation: pulse 2s infinite; }
        footer { text-align: center; padding: 48px 24px; border-top: 1px solid var(--border); color: var(--muted); font-size: .85rem; }
        footer a { color: var(--accent); text-decoration: none; }
        footer a:hover { text-decoration: underline; }
        .footer-name { font-size: 1.1rem; font-weight: 700; color: var(--text); margin-bottom: 6px; }
        @media (max-width: 640px) { .hero { padding: 70px 20px 60px; } .grid { grid-template-columns: 1fr; } }
      `}</style>

      <section className="hero">
        <div className="avatar">AG</div>
        <h1>Alexander <span>Grant</span></h1>
        <p className="tagline">Full-stack developer building web &amp; mobile products across wellness, real estate, education and more.</p>
        <div className="hero-badges">
          <span className="badge">Next.js</span>
          <span className="badge">React</span>
          <span className="badge">Flutter</span>
          <span className="badge">Supabase</span>
          <span className="badge">TypeScript</span>
          <span className="badge">AI-Powered</span>
        </div>
      </section>

      <hr className="divider" />

      <section className="section">
        <div className="container">
          <h2 className="section-title">Projects</h2>
          <p className="section-sub">A selection of web and mobile applications I&apos;ve built.</p>
          <div className="grid">

            <div className="card" style={{ ['--card-accent' as string]: 'linear-gradient(90deg,#43b89c,#2d8a70)' }}>
              <div className="card-screenshot"><img src="/screenshots/findyoga-au.jpg" alt="Find Yoga Australia" /></div>
              <div className="card-header">
                <div className="card-icon" style={{ background: 'rgba(67,184,156,.15)' }}>🧘</div>
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

            <div className="card" style={{ ['--card-accent' as string]: 'linear-gradient(90deg,#ff6584,#ff8c55)' }}>
              <div className="card-screenshot"><img src="/screenshots/balispirit.jpg" alt="Bali Spirit Festival" /></div>
              <div className="card-header">
                <div className="card-icon" style={{ background: 'rgba(255,101,132,.15)' }}>🌴</div>
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

            <div className="card" style={{ ['--card-accent' as string]: 'linear-gradient(90deg,#8b5cf6,#06b6d4)' }}>
              <div className="card-screenshot"><img src="/screenshots/vibro-acoustic.jpg" alt="Vibro-Acoustic App" /></div>
              <div className="card-header">
                <div className="card-icon" style={{ background: 'rgba(139,92,246,.15)' }}>🎵</div>
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

            <div className="card" style={{ ['--card-accent' as string]: 'linear-gradient(90deg,#ef4444,#dc2626)' }}>
              <div className="card-screenshot"><img src="/screenshots/tcm-study.jpg" alt="TCM Study" /></div>
              <div className="card-header">
                <div className="card-icon" style={{ background: 'rgba(239,68,68,.15)' }}>📚</div>
                <div className="card-meta">
                  <div className="card-name">TCM Study</div>
                  <div className="card-type">Adaptive Learning Platform</div>
                </div>
              </div>
              <p className="card-desc">Traditional Chinese Medicine exam preparation app with spaced repetition, flashcards, case studies, and an adaptive learning engine that adjusts to your knowledge gaps.</p>
              <div className="tags">
                <span className="tag">Next.js 14</span><span className="tag">Supabase</span><span className="tag">TanStack Query</span><span className="tag">Recharts</span>
              </div>
              <div className="card-footer">
                <span className="status status-live"><span className="pip pip-live"></span>Live</span>
                <a href="https://tcm-study.vercel.app" target="_blank" rel="noopener" className="btn btn-primary">Visit Site ↗</a>
              </div>
            </div>

            <div className="card" style={{ ['--card-accent' as string]: 'linear-gradient(90deg,#3b82f6,#1d4ed8)' }}>
              <div className="card-screenshot"><img src="/screenshots/real-estate.jpg" alt="Real Estate Dashboard" /></div>
              <div className="card-header">
                <div className="card-icon" style={{ background: 'rgba(59,130,246,.15)' }}>🏠</div>
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

            <div className="card" style={{ ['--card-accent' as string]: 'linear-gradient(90deg,#1db954,#1ed760)' }}>
              <div className="card-screenshot"><img src="/screenshots/iemerge-appstore.jpg" alt="iEmerge App Store" /></div>
              <div className="card-header">
                <div className="card-icon" style={{ background: 'rgba(29,185,84,.15)' }}>🌱</div>
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

            <div className="card" style={{ ['--card-accent' as string]: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}>
              <div className="card-screenshot" style={{ background: 'linear-gradient(135deg,#10102a,#1a1840)' }}><div className="card-screenshot-placeholder">🎧</div></div>
              <div className="card-header">
                <div className="card-icon" style={{ background: 'rgba(99,102,241,.15)' }}>🎧</div>
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

            <div className="card" style={{ ['--card-accent' as string]: 'linear-gradient(90deg,#f59e0b,#f97316)' }}>
              <div className="card-screenshot"><img src="/screenshots/playday.jpg" alt="Playday" /></div>
              <div className="card-header">
                <div className="card-icon" style={{ background: 'rgba(245,158,11,.15)' }}>🎉</div>
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

      <section className="section">
        <div className="container" style={{ maxWidth: 560 }}>
          <h2 className="section-title">Get in Touch</h2>
          <p className="section-sub">Send me a message on WhatsApp.</p>
          <WhatsAppForm />
        </div>
      </section>

      <footer>
        <p className="footer-name">Alexander Grant</p>
        <p>Full-stack developer &mdash; web &amp; mobile &mdash; Sydney, Australia</p>
        <br />
        <p>Built with care &mdash; <a href="mailto:alex@alexandergrant.app">alex@alexandergrant.app</a></p>
      </footer>
    </>
  )
}
