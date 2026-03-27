import { getAllResources } from '@/lib/services/resources'
import { ResourceList } from '@/components/resources/ResourceList'
import { SubmitResourceForm } from '@/components/resources/SubmitResourceForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Agentic Skills Resources | Alexander Grant',
  description: 'Community-curated resources for learning agentic AI skills, Claude Code, and automation.',
}

export default async function ResourcesPage() {
  const resources = await getAllResources()

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
      `}</style>

      <section style={{ position: 'relative', padding: '80px 24px 60px', textAlign: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(108,99,255,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <a href="/" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '.85rem', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '24px' }}>
            ← Back to Portfolio
          </a>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, letterSpacing: '-.03em', marginBottom: '12px' }}>
            Agentic Skills <span style={{ color: 'var(--accent)' }}>Resources</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 16px' }}>
            Community-curated links for learning agentic AI skills, Claude Code skills, automation tools, and more.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ background: 'var(--border)', border: '1px solid rgba(108,99,255,.3)', color: 'var(--muted)', fontSize: '.75rem', padding: '4px 12px', borderRadius: '999px', letterSpacing: '.04em', textTransform: 'uppercase' }}>Claude Code</span>
            <span style={{ background: 'var(--border)', border: '1px solid rgba(108,99,255,.3)', color: 'var(--muted)', fontSize: '.75rem', padding: '4px 12px', borderRadius: '999px', letterSpacing: '.04em', textTransform: 'uppercase' }}>AI Skills</span>
            <span style={{ background: 'var(--border)', border: '1px solid rgba(108,99,255,.3)', color: 'var(--muted)', fontSize: '.75rem', padding: '4px 12px', borderRadius: '999px', letterSpacing: '.04em', textTransform: 'uppercase' }}>Automation</span>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 24px 80px' }}>
        <SubmitResourceForm />
        <ResourceList initialResources={resources} />
      </div>

      <footer style={{ textAlign: 'center', padding: '48px 24px', borderTop: '1px solid var(--border)', color: 'var(--muted)', fontSize: '.85rem' }}>
        <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '6px' }}>Alexander Grant</p>
        <p>Part of the <a href="https://www.skool.com/scrapes" target="_blank" rel="noopener" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Agentic Academy</a> community</p>
      </footer>
    </>
  )
}
