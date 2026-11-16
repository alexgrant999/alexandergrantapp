import type { ReactNode } from 'react'

export type SummaryRow = { label: string; value: ReactNode; figure?: boolean }

/** The choices so far, set as a ledger: label left, value right beside the red double rule. */
export function BookingSummary({ rows, caption }: { rows: SummaryRow[]; caption?: string }) {
  return (
    <table className="bk-ledger">
      {caption && <caption>{caption}</caption>}
      <tbody>
        {rows.map(row => (
          <tr key={row.label} className={row.figure ? 'bk-figure' : undefined}>
            <th scope="row">{row.label}</th>
            <td>{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
