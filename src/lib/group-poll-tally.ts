/**
 * Counting a group poll. Pure, so the page, the dashboard and the owner text all
 * agree on which time is "best" without touching the database.
 */

export type TallyOption = { id: string; startsAt: Date | string }
export type TallyResponse = { name: string; yes: string[]; maybe: string[] }

export type OptionTally = {
  id: string
  yes: string[]
  maybe: string[]
  /** Everyone else who has answered. */
  no: string[]
}

export function tallyOptions(options: TallyOption[], responses: TallyResponse[]): Map<string, OptionTally> {
  const out = new Map<string, OptionTally>()
  for (const option of options) {
    const tally: OptionTally = { id: option.id, yes: [], maybe: [], no: [] }
    for (const r of responses) {
      if (r.yes.includes(option.id)) tally.yes.push(r.name)
      else if (r.maybe.includes(option.id)) tally.maybe.push(r.name)
      else tally.no.push(r.name)
    }
    out.set(option.id, tally)
  }
  return out
}

/**
 * The time most people can make: most yeses, then most "if need be", then the
 * earliest. Only times still ahead of `now` count. Null until someone has said
 * yes or maybe to a time that is still ahead.
 */
export function bestOption(options: TallyOption[], responses: TallyResponse[], now: Date = new Date()): string | null {
  const tallies = tallyOptions(options, responses)
  let best: { id: string; yes: number; maybe: number; at: number } | null = null
  for (const option of options) {
    const at = new Date(option.startsAt).getTime()
    if (at <= now.getTime()) continue
    const t = tallies.get(option.id)!
    const candidate = { id: option.id, yes: t.yes.length, maybe: t.maybe.length, at }
    if (candidate.yes + candidate.maybe === 0) continue
    if (
      !best ||
      candidate.yes > best.yes ||
      (candidate.yes === best.yes && candidate.maybe > best.maybe) ||
      (candidate.yes === best.yes && candidate.maybe === best.maybe && candidate.at < best.at)
    ) best = candidate
  }
  return best?.id ?? null
}
