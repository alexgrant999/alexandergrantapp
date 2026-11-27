'use server'

import { revalidatePath } from 'next/cache'
import { hasSession } from '@/lib/auth/session'
import {
  addPollOptions,
  choosePollOption,
  createGroupPoll,
  deleteGroupPoll,
  GroupPollInputError,
  removePollOption,
  removePollResponse,
  setPollClosed,
} from '@/lib/services/group-poll'
import { addOptionsSchema, chooseOptionSchema, createGroupPollSchema, pollIdSchema } from '@/lib/validators/group-poll'

type ActionResult = { ok: boolean; error?: string; id?: string }

// Server actions are reachable by a direct POST from any path, so each one checks the session itself.
const SIGNED_OUT: ActionResult = { ok: false, error: 'Your session has expired. Please sign in again.' }
const FAILED: ActionResult = { ok: false, error: 'Something went wrong. Please try again.' }

function refresh(pollId?: string, slug?: string) {
  revalidatePath('/dashboard/meetups')
  if (pollId) revalidatePath(`/dashboard/meetups/${pollId}`)
  if (slug) revalidatePath(`/meet/${slug}`)
}

async function run(task: () => Promise<ActionResult | void>, pollId?: string): Promise<ActionResult> {
  if (!(await hasSession())) return SIGNED_OUT
  try {
    const result = await task()
    if (result && !result.ok) return result
    refresh(pollId)
    revalidatePath('/meet/[slug]', 'page')
    return result ?? { ok: true }
  } catch (err) {
    if (err instanceof GroupPollInputError) return { ok: false, error: err.message }
    console.error('[meetups] action failed', err)
    return FAILED
  }
}

export async function createPollAction(input: unknown): Promise<ActionResult> {
  return run(async () => {
    const parsed = createGroupPollSchema.safeParse(input)
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' }
    const poll = await createGroupPoll(parsed.data)
    return { ok: true, id: poll.id }
  })
}

export async function addOptionsAction(input: unknown): Promise<ActionResult> {
  const parsed = addOptionsSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the times and try again.' }
  return run(() => addPollOptions(parsed.data.pollId, parsed.data.timezone, parsed.data.times), parsed.data.pollId)
}

export async function removeOptionAction(pollId: string, optionId: string): Promise<ActionResult> {
  if (!pollIdSchema.safeParse(pollId).success || !pollIdSchema.safeParse(optionId).success) return FAILED
  return run(() => removePollOption(optionId), pollId)
}

export async function chooseOptionAction(input: unknown): Promise<ActionResult> {
  const parsed = chooseOptionSchema.safeParse(input)
  if (!parsed.success) return FAILED
  return run(() => choosePollOption(parsed.data.pollId, parsed.data.optionId), parsed.data.pollId)
}

export async function setClosedAction(pollId: string, closed: boolean): Promise<ActionResult> {
  if (!pollIdSchema.safeParse(pollId).success) return FAILED
  return run(() => setPollClosed(pollId, closed), pollId)
}

export async function removeResponseAction(pollId: string, responseId: string): Promise<ActionResult> {
  if (!pollIdSchema.safeParse(pollId).success || !pollIdSchema.safeParse(responseId).success) return FAILED
  return run(() => removePollResponse(responseId), pollId)
}

export async function deletePollAction(pollId: string): Promise<ActionResult> {
  if (!pollIdSchema.safeParse(pollId).success) return FAILED
  return run(() => deleteGroupPoll(pollId))
}
