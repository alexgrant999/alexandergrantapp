// The grid of times on /meet/<slug>, on top of the booking pages' paper and ink kit (BookingStyles).
const CSS = `
  .gp-note { white-space:pre-line; }
  .gp-form .bk-status { margin-bottom:24px; }
  .gp-days { margin-top:24px; border-top:1px solid var(--ink); border-bottom:3px double var(--ink); }
  .gp-day + .gp-day { border-top:1px solid var(--ink); }
  .gp-day-head { margin:0; padding:16px 0 6px; font:600 1.1875rem/1.3 'Besley',serif; letter-spacing:-.01em; }
  .gp-rows { list-style:none; margin:0; padding:0; }
  .gp-row { display:grid; grid-template-columns:minmax(0,11rem) minmax(0,1fr) auto; align-items:center; gap:8px 20px; padding:14px 0; border-top:1px solid var(--line); }
  .gp-row.is-past { opacity:.55; }
  .gp-when { display:flex; flex-direction:column; align-items:flex-start; gap:4px; }
  .gp-time { font-weight:600; font-variant-numeric:lining-nums tabular-nums; }
  .gp-tag { font:italic 400 1rem/1.2 'Besley',serif; color:var(--green); }
  .gp-tag.is-quiet { color:var(--muted); }
  .gp-row.is-chosen .gp-time, .gp-row.is-best .gp-time { padding-left:10px; border-left:3px double var(--red); }
  .gp-who { display:flex; flex-direction:column; min-width:0; }
  .gp-count { font-variant-numeric:lining-nums tabular-nums; }
  .gp-names { color:var(--muted); overflow-wrap:anywhere; }
  .gp-choice { display:flex; margin:0; padding:0; border:0; min-width:0; }
  .gp-opt { position:relative; display:inline-flex; align-items:center; justify-content:center; min-height:44px; min-width:4.5rem; padding:8px 12px; border:1px solid var(--muted); font-weight:600; font-size:1rem; cursor:pointer; white-space:nowrap; transition:background .2s, color .2s, border-color .2s; }
  .gp-opt + .gp-opt { margin-left:-1px; }
  .gp-opt:first-child { border-radius:2px 0 0 2px; }
  .gp-opt:last-child { border-radius:0 2px 2px 0; }
  .gp-opt input { position:absolute; opacity:0; width:1px; height:1px; }
  .gp-opt:hover { border-color:var(--ink); }
  .gp-opt:has(input:focus-visible) { outline:3px solid var(--green); outline-offset:2px; z-index:1; }
  .gp-opt.is-yes:has(input:checked) { background:var(--green); border-color:var(--green); color:var(--paper); z-index:1; }
  .gp-opt.is-maybe:has(input:checked) { background:color-mix(in oklch, var(--green) 16%, var(--paper)); border-color:var(--green); z-index:1; }
  .gp-opt.is-no:has(input:checked) { background:var(--ink); border-color:var(--ink); color:var(--paper); z-index:1; }
  .gp-choice:disabled .gp-opt { cursor:default; }
  .gp-choice:disabled .gp-opt:not(:has(input:checked)) { color:var(--muted); border-color:var(--line); }

  .gp-people { list-style:none; margin:18px 0 0; padding:0; border-top:1px solid var(--ink); }
  .gp-people li { display:flex; flex-wrap:wrap; justify-content:space-between; gap:0 16px; padding:12px 0; border-bottom:1px solid var(--line); }
  .gp-people span { color:var(--muted); font-variant-numeric:lining-nums tabular-nums; }

  @media (max-width:620px) {
    .gp-row { grid-template-columns:minmax(0,1fr) auto; }
    .gp-who { grid-column:1 / -1; grid-row:2; }
    .gp-choice { grid-column:1 / -1; grid-row:3; }
    .gp-opt { flex:1; }
  }
`

export function PollStyles() {
  return <style>{CSS}</style>
}
