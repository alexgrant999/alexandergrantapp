// The homepage's paper and ink kit (DESIGN.md), restated for the booking pages, which do not load the homepage's styles.
// Smallest text here is 1rem: visitors arrive from an ad, on a phone.
const TOKENS = `--paper:#f3f0e8; --ink:oklch(23% .02 155); --muted:oklch(45% .02 150); --green:oklch(38% .075 160); --green-deep:oklch(31% .06 160); --red:oklch(52% .17 27); --rule:oklch(80% .045 235); --line:oklch(86% .015 120); --gutter:clamp(18px,3.2vw,52px);`

// Everything the day, time and details flow needs, scoped to .bk (a booking page) or .bk-flow (the flow embedded in another page).
const PARTS = `
  .bk-flow { ${TOKENS} color:var(--ink); font:400 1.0625rem/1.55 'Libre Franklin',sans-serif; }
  :is(.bk,.bk-flow) a { color:inherit; }
  :is(.bk,.bk-flow) :focus-visible { outline:3px solid var(--green); outline-offset:3px; }
  :is(.bk,.bk-flow) [tabindex="-1"]:focus { outline:none; }
  :is(.bk,.bk-flow) .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }

  .bk-textlink { display:inline-flex; align-items:center; min-height:44px; font-weight:600; text-decoration:underline; text-underline-offset:5px; text-decoration-thickness:1px; }
  :is(.bk,.bk-flow) a.bk-textlink { color:var(--green); }
  .bk-textlink:hover { text-decoration-thickness:2px; }

  .bk-h2 { margin:0; font:600 clamp(1.6rem,2.3vw,2.1rem)/1.1 'Besley',serif; letter-spacing:-.01em; }
  .bk-h3 { margin:0; font:600 1.375rem/1.2 'Besley',serif; letter-spacing:-.01em; }
  .bk-copy { margin:14px 0 0; max-width:52ch; }
  .bk-copy + .bk-copy { margin-top:10px; }

  /* Where the visitor is in the flow, and the one way back. */
  .bk-flow-nav { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:0 20px; min-height:44px; border-bottom:1px solid var(--line); }
  .bk-flow-step { margin:0; font-weight:600; color:var(--muted); font-variant-numeric:lining-nums tabular-nums; }
  .bk-flow .bk-flow-nav + * { margin-top:22px; }

  /* The visitor's choices so far, set as a ledger. The chosen time is the figure. */
  .bk-ledger { width:100%; margin-top:28px; border-collapse:collapse; border-top:1px solid var(--ink); border-bottom:3px double var(--ink); font-variant-numeric:lining-nums tabular-nums; }
  .bk-ledger caption { caption-side:top; text-align:left; padding-bottom:10px; font:italic 400 1.125rem/1.4 'Besley',serif; }
  .bk-ledger th { text-align:left; vertical-align:middle; font-weight:400; padding:11px 16px 11px 0; color:var(--muted); }
  .bk-ledger td { width:1%; white-space:nowrap; text-align:right; padding:9px 0 9px 18px; border-left:3px double var(--red); font:600 1.25rem/1.25 'Besley',serif; }
  .bk-ledger tr + tr > * { border-top:1px solid var(--rule); }
  .bk-ledger .bk-figure td { padding:14px 0 14px 24px; font-size:clamp(2.2rem,4.5vw,4rem); line-height:1; }
  .bk-ledger + .bk-h2 { margin-top:32px; }

  .bk-zone { display:flex; flex-wrap:wrap; align-items:center; gap:0 14px; margin:6px 0 0; color:var(--muted); }
  .bk-linkbutton { min-height:44px; padding:0; background:none; border:0; font:600 1rem 'Libre Franklin',sans-serif; color:var(--green); text-decoration:underline; text-underline-offset:5px; text-decoration-thickness:1px; cursor:pointer; }
  .bk-linkbutton:hover { text-decoration-thickness:2px; }
  .bk-ledger + div .bk-zone { margin-top:14px; }
  .bk-zone-pick { display:flex; flex-direction:column; gap:4px; margin-top:4px; }
  .bk-select { width:100%; max-width:420px; min-height:48px; padding:8px 0; background:transparent; color:var(--ink); border:0; border-bottom:1px solid var(--ink); border-radius:0; font:400 1.0625rem 'Libre Franklin',sans-serif; }

  /* Day and time together: a month with the open days marked, and the chosen day's times beside it. */
  .bk-cal { display:grid; grid-template-columns:minmax(0,1fr) minmax(0,15rem); margin-top:20px; border-top:1px solid var(--ink); border-bottom:3px double var(--ink); }
  .bk-cal-month { padding:18px clamp(20px,3vw,36px) 22px 0; }
  .bk-cal-times { padding:18px 0 22px clamp(20px,3vw,36px); border-left:1px solid var(--line); }
  .bk-cal-head { display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:44px; }
  .bk-cal-title { margin:0; font:600 1.375rem/1.2 'Besley',serif; letter-spacing:-.01em; }
  .bk-cal-times .bk-cal-title { display:flex; align-items:center; min-height:44px; font-size:1.1875rem; }
  .bk-cal-nav { display:flex; gap:4px; }
  .bk-cal-arrow { display:inline-flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:2px; transition:background .2s, color .2s; }
  a.bk-cal-arrow:hover { background:var(--ink); color:var(--paper); }
  .bk-cal-arrow[aria-disabled="true"] { color:var(--line); }
  .bk-cal-grid { width:calc(100% + 8px); margin:8px -4px 0; border-collapse:separate; border-spacing:4px; table-layout:fixed; font-variant-numeric:lining-nums tabular-nums; }
  .bk-cal-grid th { padding:6px 0; font-weight:600; color:var(--muted); text-align:center; }
  .bk-cal-grid td { padding:0; }
  .bk-cal-day { position:relative; display:flex; align-items:center; justify-content:center; min-height:48px; border-radius:2px; color:var(--muted); text-decoration:none; transition:background .2s, color .2s; }
  .bk-cal-day.is-out { opacity:.45; }
  :is(.bk,.bk-flow) a.bk-cal-day { opacity:1; font-weight:700; color:var(--ink); background:color-mix(in oklch, var(--green) 13%, var(--paper)); }
  :is(.bk,.bk-flow) a.bk-cal-day:hover, :is(.bk,.bk-flow) a.bk-cal-day:has(.bk-pending.is-on) { background:var(--ink); color:var(--paper); }
  :is(.bk,.bk-flow) a.bk-cal-day[aria-current="date"] { background:var(--green); color:var(--paper); }
  .bk-cal-day.is-today::after { content:''; position:absolute; bottom:6px; left:50%; width:5px; height:5px; margin-left:-2.5px; border-radius:50%; background:var(--red); }
  a.bk-cal-day[aria-current="date"].is-today::after { background:var(--paper); }
  .bk-cal-count { margin:0; color:var(--muted); font-variant-numeric:lining-nums tabular-nums; }
  .bk-cal-slots { list-style:none; margin:14px 0 0; padding:0; display:grid; gap:8px; }
  @media (max-width:620px) {
    .bk-cal { grid-template-columns:minmax(0,1fr); }
    .bk-cal-month { padding-right:0; }
    .bk-cal-times { padding-left:0; border-left:0; border-top:1px solid var(--line); }
    .bk-cal-slots { grid-template-columns:repeat(auto-fill,minmax(108px,1fr)); }
  }

  .bk-pending { display:none; }
  .bk-slot { display:flex; align-items:center; justify-content:center; min-height:52px; padding:10px 6px; border:1px solid var(--muted); border-radius:2px; font-weight:600; text-decoration:none; font-variant-numeric:lining-nums tabular-nums; transition:background .2s, color .2s, border-color .2s; }
  .bk-slot:hover, .bk-slot:has(.bk-pending.is-on) { background:var(--ink); border-color:var(--ink); color:var(--paper); }

  /* Details form: underlined fields, no boxes. */
  .bk-form { position:relative; display:flex; flex-direction:column; gap:28px; margin-top:24px; }
  .bk-field { display:flex; flex-direction:column; }
  .bk-label { font-weight:600; }
  .bk-hint { margin:0; color:var(--muted); }
  .bk-input { width:100%; min-height:48px; margin-top:2px; padding:10px 0 12px; background:transparent; color:var(--ink); border:0; border-bottom:1px solid var(--ink); border-radius:0; font:400 1.0625rem/1.5 'Libre Franklin',sans-serif; }
  textarea.bk-input { min-height:140px; resize:vertical; }
  .bk-input[aria-invalid="true"] { border-bottom:3px double var(--ink); }
  .bk-count { margin:6px 0 0; color:var(--muted); text-align:right; font-variant-numeric:lining-nums tabular-nums; }
  .bk-error { margin:8px 0 0; font-weight:600; }
  .bk-error:empty { margin:0; }
  .bk-trap { position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden; }
  .bk-submit { display:flex; flex-direction:column; align-items:flex-start; gap:12px; }

  .bk-button { display:inline-flex; align-items:center; justify-content:center; min-height:52px; padding:14px 24px; background:var(--green); color:var(--paper); border:0; border-radius:2px; font:600 1.0625rem/1.2 'Libre Franklin',sans-serif; text-align:center; text-decoration:none; cursor:pointer; transition:background .2s; }
  :is(.bk,.bk-flow) a.bk-button { color:var(--paper); }
  .bk-button:hover { background:var(--ink); }
  .bk-button:disabled { background:var(--muted); cursor:progress; }
  .bk-actions { display:flex; flex-wrap:wrap; align-items:center; gap:10px 28px; margin-top:28px; }

  .bk-status:focus { outline:none; }
  .bk-status { margin:0 0 28px; padding:14px 0; border-top:1px solid var(--ink); border-bottom:1px solid var(--ink); font-weight:600; }
  .bk-status:empty { margin:0; padding:0; border:0; }

  /* What happens next, numbered like the services list on the homepage. */
  .bk-next { list-style:none; margin:18px 0 0; padding:0; border-top:1px solid var(--ink); counter-reset:step; }
  .bk-next li { display:grid; grid-template-columns:2.25rem minmax(0,1fr); gap:0 12px; padding:16px 0; border-bottom:1px solid var(--line); max-width:60ch; }
  .bk-next li::before { counter-increment:step; content:counter(step, decimal-leading-zero); padding-top:.1rem; font-weight:600; color:var(--muted); font-variant-numeric:lining-nums tabular-nums; }
  .bk-next b { display:block; margin-bottom:4px; font:600 1.1875rem/1.3 'Besley',serif; }
  .bk-next li > * { color:var(--muted); }
  .bk-next b, .bk-next a { color:var(--ink); }

  @media (max-width:860px) {
    .bk-button { width:100%; }
    .bk-actions .bk-textlink { width:100%; justify-content:center; }
  }
  @media (prefers-reduced-motion:reduce) { :is(.bk,.bk-flow) * { transition:none!important; } }
`

// The page around the flow on /book, /book/thanks and /book/manage: header, folio, two columns, footer.
const PAGE = `
  :root { ${TOKENS} }
  body { margin:0; background:var(--paper); color:var(--ink); font:400 1.0625rem/1.55 'Libre Franklin',sans-serif; }
  ::selection { background:var(--green); color:var(--paper); }
  .bk { min-height:100svh; display:flex; flex-direction:column; }
  .bk-page { width:min(1440px,100%); margin:0 auto; padding:0 var(--gutter); }

  .bk-top { display:flex; align-items:center; justify-content:space-between; gap:20px; min-height:76px; }
  .bk-mark { display:inline-flex; align-items:center; min-height:44px; font:700 1.25rem/1 'Besley',serif; text-decoration:none; }

  .bk-main { flex:1; padding-bottom:clamp(64px,8vw,120px); }
  .bk-folio { display:flex; justify-content:space-between; gap:20px; margin:0; padding:10px 0; border-top:1px solid var(--ink); border-bottom:1px solid var(--line); font-size:1rem; font-weight:600; font-variant-numeric:lining-nums tabular-nums; }
  .bk-folio span + span { font-weight:400; color:var(--muted); }

  .bk-grid { display:grid; grid-template-columns:minmax(0,5fr) minmax(0,7fr); grid-template-areas:"intro step" "aside step"; grid-template-rows:auto 1fr; gap:0 clamp(40px,7vw,120px); margin-top:clamp(32px,4.5vw,64px); }
  .bk-intro { grid-area:intro; }
  .bk-step { grid-area:step; max-width:680px; }
  .bk-aside { grid-area:aside; margin-top:clamp(40px,5vw,72px); }
  .bk-step > .bk-ledger:first-child, .bk-step > .bk-status + * { margin-top:0; }

  .bk-h1 { margin:0; max-width:13ch; font:700 clamp(2.4rem,4vw,3.75rem)/1.02 'Besley',serif; letter-spacing:-.01em; }
  .bk-h1-quiet { max-width:16ch; font-size:clamp(2rem,3vw,2.75rem); line-height:1.08; }
  .bk-lead { margin:20px 0 0; max-width:38ch; font-size:clamp(1.125rem,1.3vw,1.25rem); line-height:1.5; }

  .bk-foot { background:var(--ink); color:var(--paper); }
  .bk-foot-in { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:4px 28px; padding:22px var(--gutter); width:min(1440px,100%); margin:0 auto; }
  .bk-foot p { margin:0; }
  .bk-foot a { display:inline-flex; align-items:center; min-height:44px; font-weight:600; text-underline-offset:5px; }
  .bk-foot :focus-visible { outline-color:var(--paper); }

  @media (max-width:860px) {
    .bk-grid { grid-template-columns:minmax(0,1fr); grid-template-areas:"intro" "step" "aside"; grid-template-rows:none; }
    .bk-step { margin-top:36px; }
    .bk-aside { margin-top:56px; }
    .bk-h1 { font-size:clamp(2.25rem,9.5vw,3rem); }
    .bk-h1-quiet { font-size:clamp(2rem,8vw,2.5rem); }
  }
`

/** Full booking page styles. Rendered once by BookingShell. */
export function BookingStyles() {
  return <style>{PAGE + PARTS}</style>
}

/** Only what the flow needs, with the tokens scoped to .bk-flow, for a page that embeds BookingFlow without BookingShell. */
export function BookingFlowStyles() {
  return <style>{PARTS}</style>
}
