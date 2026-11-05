import { NextResponse } from 'next/server'
import { getClients, createClient } from '@/lib/services/clients'
import { clientSchema } from '@/lib/validators/client'
import { hasSession } from '@/lib/auth/session'

export async function GET() {
  if (!(await hasSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const clients = await getClients()
  return NextResponse.json(clients)
}

export async function POST(req: Request) {
  if (!(await hasSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const parsed = clientSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const client = await createClient(parsed.data)
  return NextResponse.json(client, { status: 201 })
}
