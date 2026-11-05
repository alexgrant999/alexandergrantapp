import { NextResponse } from 'next/server'
import { getTimeEntries, createTimeEntry } from '@/lib/services/time'
import { timeEntrySchema } from '@/lib/validators/time'
import { hasSession } from '@/lib/auth/session'

export async function GET() {
  if (!(await hasSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const entries = await getTimeEntries()
  return NextResponse.json(entries)
}

export async function POST(req: Request) {
  if (!(await hasSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const parsed = timeEntrySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const entry = await createTimeEntry(parsed.data)
  return NextResponse.json(entry, { status: 201 })
}
