import crypto from 'node:crypto'
import { prisma } from '@/lib/db/prisma'
import { formatWhen, zoneCity, zonedTimeToUtc } from '@/lib/time'
import { bestOption, tallyOptions, type OptionTally } from '@/lib/group-poll-tally'
import { appUrl, foldLine, icsText, utcStamp } from '@/lib/services/booking-email'
import { sendOwnerText } from '@/lib/services/booking-reminders'
import { getCalendarBusy } from '@/lib/services/google-calendar'
import type { Defer } from '@/lib/services/booking'
import type { CreateGroupPollInput, RespondInput } from '@/lib/validators/group-poll'

/**
 * Group polls: "find a time that works" for a meetup. Built on the booking
 * scheduler's pieces: times are entered as wall clock in a zone and stored as
 * instants (zonedTimeToUtc), shown on each visitor's own clock, checked against
 * Alex's Google Calendar busy time, and responses text Alex through the same
 * messaging service as booking notices.
 *
 * Server only: this module imports Prisma.
 */

/** Form abuse brakes, not rules. A poll link gets shared around a group chat. */
const MAX_RESPONSES_PER_IP_PER_HOUR = 12
const MAX_RESPONSES_PER_POLL = 200

export class GroupPollInputError extends Error {}

export type PollOptionView = {
  id: string
  startsAt: string
  endsAt: string
  past: boolean
  tally: OptionTally
  /** Overlaps busy time on Alex's Google Calendar. Dashboard only. */
  clashes?: boolean
}

export type PollView = {
  id: string
  slug: string
  title: string
  note: string | null
  durationMinutes: number
  timezone: string
  meetingUrl: string | null
  chosenOptionId: string | null
  closed: boolean
  options: PollOptionView[]
  responses: { id: string; name: string; timezone: string | null; yes: string[]; maybe: string[]; updatedAt: string }[]
  bestOptionId: string | null
  url: string
}

function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return `${base || 'meetup'}-${crypto.randomBytes(3).toString('hex')}`
}

function hashIp(ip: string | null): string | null {
  if (!ip) return null
  return crypto.createHmac('sha256', process.env.SESSION_SECRET ?? '').update(`ip:${ip}`).digest('hex').slice(0, 32)
}

export function pollUrl(slug: string): string {
  return `${appUrl()}/meet/${slug}`
}

/** Wall clock times on `timezone` as instants, deduplicated and in order. */
function toSpans(times: { date: string; time: string }[], timezone: string, durationMinutes: number) {
  const seen = new Set<number>()
  const spans: { startsAt: Date; endsAt: Date }[] = []
  for (const t of times) {
    const startsAt = zonedTimeToUtc(t.date, t.time, timezone)
    if (Number.isNaN(startsAt.getTime()) || seen.has(startsAt.getTime())) continue
    seen.add(startsAt.getTime())
    spans.push({ startsAt, endsAt: new Date(startsAt.getTime() + durationMinutes * 60_000) })
  }
  return spans.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
}

export async function createGroupPoll(input: CreateGroupPollInput): Promise<{ id: string; slug: string }> {
  const spans = toSpans(input.times, input.timezone, input.durationMinutes)
  if (spans.length < 2) throw new GroupPollInputError('Offer at least two different times.')

  const poll = await prisma.groupPoll.create({
    data: {
      slug: slugify(input.title),
      title: input.title,
      note: input.note ?? null,
      durationMinutes: input.durationMinutes,
      timezone: input.timezone,
      meetingUrl: input.meetingUrl ?? null,
      options: { create: spans },
    },
    select: { id: true, slug: true },
  })
  return poll
}

export async function addPollOptions(pollId: string, timezone: string, times: { date: string; time: string }[]): Promise<void> {
  const poll = await prisma.groupPoll.findUnique({ where: { id: pollId }, select: { durationMinutes: true } })
  if (!poll) throw new GroupPollInputError('That poll no longer exists.')
  const spans = toSpans(times, timezone, poll.durationMinutes)
  await prisma.groupPollOption.createMany({ data: spans.map(s => ({ ...s, pollId })), skipDuplicates: true })
}

/** Removes a time and every answer to it. If it was the chosen time, the poll goes back to undecided. */
export async function removePollOption(optionId: string): Promise<void> {
  await prisma.$transaction(async tx => {
    const option = await tx.groupPollOption.delete({ where: { id: optionId }, select: { pollId: true } })
    const responses = await tx.groupPollResponse.findMany({ where: { pollId: option.pollId }, select: { id: true, yes: true, maybe: true } })
    for (const r of responses) {
      if (!r.yes.includes(optionId) && !r.maybe.includes(optionId)) continue
      await tx.groupPollResponse.update({
        where: { id: r.id },
        data: { yes: r.yes.filter(id => id !== optionId), maybe: r.maybe.filter(id => id !== optionId) },
      })
    }
    await tx.groupPoll.updateMany({ where: { id: option.pollId, chosenOptionId: optionId }, data: { chosenOptionId: null } })
  })
}

export async function choosePollOption(pollId: string, optionId: string | null): Promise<void> {
  if (optionId) {
    const option = await prisma.groupPollOption.findFirst({ where: { id: optionId, pollId }, select: { id: true } })
    if (!option) throw new GroupPollInputError('That time is not part of this poll.')
  }
  await prisma.groupPoll.update({ where: { id: pollId }, data: { chosenOptionId: optionId } })
}

export async function setPollClosed(pollId: string, closed: boolean): Promise<void> {
  await prisma.groupPoll.update({ where: { id: pollId }, data: { closedAt: closed ? new Date() : null } })
}

export async function deleteGroupPoll(pollId: string): Promise<void> {
  await prisma.groupPoll.delete({ where: { id: pollId } })
}

export async function removePollResponse(responseId: string): Promise<void> {
  await prisma.groupPollResponse.delete({ where: { id: responseId } })
}

type PollRow = NonNullable<Awaited<ReturnType<typeof loadPoll>>>

function loadPoll(where: { id: string } | { slug: string }) {
  return prisma.groupPoll.findUnique({
    where,
    include: {
      options: { orderBy: { startsAt: 'asc' } },
      responses: { orderBy: { createdAt: 'asc' } },
    },
  })
}

function toView(poll: PollRow, now: Date, busy?: { startsAt: Date; endsAt: Date }[]): PollView {
  const tallies = tallyOptions(poll.options, poll.responses)
  return {
    id: poll.id,
    slug: poll.slug,
    title: poll.title,
    note: poll.note,
    durationMinutes: poll.durationMinutes,
    timezone: poll.timezone,
    meetingUrl: poll.meetingUrl,
    chosenOptionId: poll.chosenOptionId,
    closed: poll.closedAt !== null,
    options: poll.options.map(o => ({
      id: o.id,
      startsAt: o.startsAt.toISOString(),
      endsAt: o.endsAt.toISOString(),
      past: o.startsAt.getTime() <= now.getTime(),
      tally: tallies.get(o.id)!,
      ...(busy ? { clashes: busy.some(b => o.startsAt < b.endsAt && o.endsAt > b.startsAt) } : {}),
    })),
    responses: poll.responses.map(r => ({ id: r.id, name: r.name, timezone: r.timezone, yes: r.yes, maybe: r.maybe, updatedAt: r.updatedAt.toISOString() })),
    bestOptionId: bestOption(poll.options, poll.responses, now),
    url: pollUrl(poll.slug),
  }
}

/** The public page's view. Null when there is no such poll. */
export async function getPublicPoll(slug: string): Promise<PollView | null> {
  const poll = await loadPoll({ slug })
  return poll ? toView(poll, new Date()) : null
}

/** The dashboard's view, with each time checked against Alex's Google Calendar. */
export async function getDashboardPoll(id: string): Promise<PollView | null> {
  const poll = await loadPoll({ id })
  if (!poll) return null
  const first = poll.options[0]
  const last = poll.options.at(-1)
  const busy = first && last ? await getCalendarBusy(first.startsAt, last.endsAt).catch(() => []) : []
  return toView(poll, new Date(), busy)
}

export async function listGroupPolls() {
  const polls = await prisma.groupPoll.findMany({
    orderBy: { createdAt: 'desc' },
    include: { options: { select: { id: true, startsAt: true }, orderBy: { startsAt: 'asc' } }, responses: { select: { name: true, yes: true, maybe: true } } },
  })
  const now = new Date()
  return polls.map(p => {
    const chosen = p.options.find(o => o.id === p.chosenOptionId)
    const best = bestOption(p.options, p.responses, now)
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      timezone: p.timezone,
      closed: p.closedAt !== null,
      optionCount: p.options.length,
      responseCount: p.responses.length,
      chosenStartsAt: chosen?.startsAt.toISOString() ?? null,
      bestStartsAt: p.options.find(o => o.id === best)?.startsAt.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    }
  })
}

export type RespondResult =
  | { ok: true; editToken: string; updated: boolean }
  | { ok: false; error: 'not_found' | 'closed' | 'rate_limited' | 'full' }

/**
 * Saves one person's answers. A known `editToken` (from their cookie) updates their
 * row; otherwise a new row is made. Option ids that are not part of this poll, or
 * are already past, are dropped, and a time cannot be both yes and maybe.
 */
export async function respondToPoll(input: RespondInput, ctx: { ip: string | null; editToken: string | null; defer?: Defer }): Promise<RespondResult> {
  const poll = await prisma.groupPoll.findUnique({
    where: { slug: input.slug },
    select: { id: true, title: true, timezone: true, closedAt: true, options: { select: { id: true, startsAt: true } } },
  })
  if (!poll) return { ok: false, error: 'not_found' }
  if (poll.closedAt) return { ok: false, error: 'closed' }

  const now = Date.now()
  const open = new Set(poll.options.filter(o => o.startsAt.getTime() > now).map(o => o.id))
  const yes = [...new Set(input.yes)].filter(id => open.has(id))
  const maybe = [...new Set(input.maybe)].filter(id => open.has(id) && !yes.includes(id))

  const existing = ctx.editToken
    ? await prisma.groupPollResponse.findFirst({ where: { pollId: poll.id, editToken: ctx.editToken }, select: { id: true, editToken: true, yes: true, maybe: true } })
    : null

  // Keep answers to times that have since passed: they are history, not something to clear.
  const keepPast = (ids: string[]) => ids.filter(id => !open.has(id))

  if (existing) {
    await prisma.groupPollResponse.update({
      where: { id: existing.id },
      data: { name: input.name, timezone: input.timezone ?? null, yes: [...keepPast(existing.yes), ...yes], maybe: [...keepPast(existing.maybe), ...maybe] },
    })
    return { ok: true, editToken: existing.editToken, updated: true }
  }

  const ipHash = hashIp(ctx.ip)
  if (ipHash) {
    const recent = await prisma.groupPollResponse.count({ where: { ipHash, createdAt: { gt: new Date(now - 60 * 60_000) } } })
    if (recent >= MAX_RESPONSES_PER_IP_PER_HOUR) return { ok: false, error: 'rate_limited' }
  }
  if ((await prisma.groupPollResponse.count({ where: { pollId: poll.id } })) >= MAX_RESPONSES_PER_POLL) return { ok: false, error: 'full' }

  const editToken = crypto.randomBytes(18).toString('base64url')
  await prisma.groupPollResponse.create({ data: { pollId: poll.id, name: input.name, timezone: input.timezone ?? null, yes, maybe, editToken, ipHash } })

  const notify = async () => {
    const name = input.name.replace(/\s+/g, ' ').slice(0, 40)
    const can = yes.length === 1 ? '1 time' : `${yes.length} times`
    await sendOwnerText(`${name} answered "${poll.title.slice(0, 50)}": can make ${can}. ${pollUrl(input.slug)}`, `poll ${poll.id}`)
  }
  if (ctx.defer) ctx.defer(notify)
  else await notify()

  return { ok: true, editToken, updated: false }
}

/** The response that belongs to this browser, if any, so the form can open with its answers. */
export async function findOwnResponse(slug: string, editToken: string | null) {
  if (!editToken) return null
  return prisma.groupPollResponse.findFirst({
    where: { editToken, poll: { slug } },
    select: { name: true, yes: true, maybe: true },
  })
}

/** The chosen time as a calendar file. Null until Alex has picked one. */
export function pollIcs(poll: PollView, now = new Date()): string | null {
  const chosen = poll.options.find(o => o.id === poll.chosenOptionId)
  if (!chosen) return null
  const description = [poll.note ?? '', poll.meetingUrl ? `Join here: ${poll.meetingUrl}` : '', `Who is coming: ${poll.url}`].filter(Boolean).join('\n\n')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Alexander Grant//Group polls//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${chosen.id}@alexandergrant.app`,
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${utcStamp(new Date(chosen.startsAt))}`,
    `DTEND:${utcStamp(new Date(chosen.endsAt))}`,
    `SUMMARY:${icsText(poll.title)}`,
    `LOCATION:${icsText(poll.meetingUrl ?? '')}`,
    `DESCRIPTION:${icsText(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return `${lines.map(foldLine).join('\r\n')}\r\n`
}

/** "Friday, Dec 4 at 7:30 pm Sydney time", for Alex. */
export function ownerWhen(at: string | Date, timezone: string): string {
  return `${formatWhen(new Date(at), timezone)} ${zoneCity(timezone)} time`
}
