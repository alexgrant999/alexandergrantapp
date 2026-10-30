import type { CSSProperties } from 'react'

// Whole-number figures count up as they scroll into view. The real text stays in the DOM for screen readers.
export function Figure({ value }: { value: string }) {
  const m = value.match(/^([^0-9]*)(\d+)([^0-9]*)$/)
  if (!m) return <>{value}</>
  const [, prefix, n, suffix] = m
  return (
    <span className="count" style={{ '--to': n } as CSSProperties} data-prefix={prefix} data-suffix={suffix}>
      <span className="count-static">{value}</span>
    </span>
  )
}

// Figures set like an account book: blue row lines, a red double rule before the amount, a double rule under the last line.
export function Ledger({ rows, caption, large, plain }: { rows: string[][]; caption?: string; large?: boolean; plain?: boolean }) {
  return (
    <table className={large ? 'ledger ledger-lg' : 'ledger'}>
      {caption && <caption>{caption}</caption>}
      <tbody>{rows.map(([label, figure]) => <tr key={label}><th scope="row">{label}</th><td>{plain ? figure : <Figure value={figure} />}</td></tr>)}</tbody>
    </table>
  )
}
