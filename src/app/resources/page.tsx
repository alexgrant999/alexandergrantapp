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
        /* The homepage's paper and ink kit (DESIGN.md), restated because this page does not load the homepage's styles. */
        :root { --paper:#f3f0e8; --ink:oklch(23% .02 155); --muted:oklch(45% .02 150); --green:oklch(38% .075 160); --line:oklch(86% .015 120); --gutter:clamp(18px,3.2vw,52px); }
        * { box-sizing:border-box; }
        body { margin:0; background:var(--paper); color:var(--ink); font:400 1.0625rem/1.55 'Libre Franklin',sans-serif; }
        a { color:inherit; }
        :focus-visible { outline:3px solid var(--green); outline-offset:3px; }
        .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
        .rs { width:min(1100px,100%); margin:auto; padding:0 var(--gutter); }

        .rs-nav { display:flex; justify-content:space-between; align-items:center; gap:20px; min-height:72px; border-bottom:1px solid var(--ink); }
        .rs-wordmark { padding:12px 0; font:700 1.25rem/1 'Besley',serif; text-decoration:none; }
        .rs-nav span { font-size:.9375rem; color:var(--muted); font-variant-numeric:lining-nums tabular-nums; }

        .rs-head { padding:clamp(40px,6vw,80px) 0 clamp(32px,4vw,48px); }
        .rs h1 { margin:0; max-width:16ch; font:700 clamp(2.4rem,5vw,3.75rem)/1.02 'Besley',serif; letter-spacing:-.01em; text-wrap:balance; }
        .rs-lead { margin:20px 0 0; max-width:52ch; font-size:1.1875rem; line-height:1.5; text-wrap:pretty; }
        .rs-share { margin-top:26px; }

        .rs-button { display:inline-flex; align-items:center; min-height:52px; padding:14px 24px; background:var(--green); color:var(--paper); border:0; border-radius:2px; font:600 1rem 'Libre Franklin',sans-serif; cursor:pointer; transition:background .2s; }
        .rs-button:hover { background:var(--ink); }
        .rs-button:disabled { background:var(--muted); cursor:not-allowed; }
        .rs-linkbutton { min-height:44px; padding:0; background:none; border:0; font:600 1rem 'Libre Franklin',sans-serif; color:var(--green); text-decoration:underline; text-underline-offset:5px; text-decoration-thickness:1px; cursor:pointer; }

        .rs-form { display:grid; gap:18px; max-width:640px; margin-top:26px; padding:14px 0 28px; border-top:1px solid var(--ink); border-bottom:3px double var(--ink); }
        .rs-form-head { display:flex; justify-content:space-between; align-items:center; gap:20px; }
        .rs-form h2 { margin:0; font:600 1.375rem/1.2 'Besley',serif; letter-spacing:-.01em; }
        .rs-field { display:grid; gap:2px; }
        .rs-field label { font-size:.9375rem; font-weight:600; }
        .rs-input { width:100%; min-height:48px; padding:8px 0; background:transparent; color:var(--ink); border:0; border-bottom:1px solid var(--ink); border-radius:0; font:400 1.0625rem 'Libre Franklin',sans-serif; resize:vertical; }
        .rs-input::placeholder { color:var(--muted); }
        .rs-input:disabled { opacity:.5; }
        .rs-pair { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
        .rs-note { margin:0; color:var(--muted); }
        .rs-status { margin:0; font-weight:600; }
        .rs-form .rs-button { justify-self:start; }

        .rs-filters { display:flex; flex-wrap:wrap; gap:0 22px; }
        .rs-filter { min-height:44px; padding:0; background:none; border:0; border-bottom:2px solid transparent; font:600 .9375rem 'Libre Franklin',sans-serif; color:var(--muted); cursor:pointer; transition:color .2s; }
        .rs-filter:hover { color:var(--ink); }
        .rs-filter[aria-pressed="true"] { color:var(--ink); border-color:var(--ink); }

        .rs-list { list-style:none; margin:8px 0 0; padding:0; border-top:1px solid var(--ink); }
        .rs-item { position:relative; display:grid; grid-template-columns:minmax(0,1fr) 220px; gap:clamp(20px,3vw,48px); align-items:start; padding:24px 0; border-bottom:1px solid var(--line); }
        .rs-item h2 { margin:0; font:600 clamp(1.35rem,1.9vw,1.75rem)/1.15 'Besley',serif; letter-spacing:-.01em; text-wrap:balance; }
        .rs-item h2 a { text-decoration:none; outline:none; }
        .rs-item h2 a::after { content:''; position:absolute; inset:0; }
        .rs-item h2 a:focus-visible::after { outline:3px solid var(--green); outline-offset:4px; }
        .rs-item:hover h2 { text-decoration:underline; text-decoration-thickness:2px; text-underline-offset:6px; }
        .rs-domain { display:block; margin-top:6px; font-size:.9375rem; font-weight:600; color:var(--green); }
        .rs-desc { margin:10px 0 0; max-width:60ch; text-wrap:pretty; }
        .rs-meta { margin:10px 0 0; font-size:.9375rem; color:var(--muted); }
        .rs-thumb { display:block; width:100%; aspect-ratio:16/10; object-fit:cover; object-position:top; border:1px solid var(--line); background:var(--line); filter:sepia(.08) saturate(.94); }
        .rs-thumb[hidden] { display:none; }
        .rs-empty { margin:0; padding:28px 0; border-bottom:1px solid var(--line); }

        .rs-foot { margin-top:clamp(56px,7vw,96px); background:var(--ink); color:var(--paper); font-size:.9375rem; }
        .rs-foot .rs { display:flex; flex-wrap:wrap; justify-content:space-between; gap:8px 20px; padding-top:28px; padding-bottom:28px; }
        .rs-foot a { text-underline-offset:5px; }
        .rs-foot :focus-visible { outline-color:var(--paper); }

        @media (max-width:700px) {
          .rs-item { grid-template-columns:1fr; gap:16px; }
          .rs-pair { grid-template-columns:1fr; }
        }
        @media (prefers-reduced-motion:reduce) { * { transition:none!important; } }
      `}</style>

      <div className="rs">
        <nav className="rs-nav" aria-label="Main navigation">
          <a className="rs-wordmark" href="/">Alexander Grant</a>
          <span>{resources.length} {resources.length === 1 ? 'link' : 'links'}</span>
        </nav>

        <main>
          <header className="rs-head">
            <h1>Agentic skills resources</h1>
            <p className="rs-lead">Links for learning agentic AI skills, Claude Code and automation tools, collected by the Agentic Academy community.</p>
            <SubmitResourceForm />
          </header>
          <ResourceList initialResources={resources} />
        </main>
      </div>

      <footer className="rs-foot">
        <div className="rs">
          <span>Alexander Grant</span>
          <span>Part of the <a href="https://www.skool.com/scrapes" target="_blank" rel="noopener noreferrer">Agentic Academy<span className="sr-only"> (opens in a new tab)</span></a> community</span>
        </div>
      </footer>
    </>
  )
}
