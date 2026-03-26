import { NextResponse } from 'next/server'
import { getClients, createClient } from '@/lib/services/clients'
import { clientSchema } from '@/lib/validators/client'

export async function GET() {
  const clients = await getClients()
  return NextResponse.json(clients)
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = clientSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const client = await createClient(parsed.data)
  return NextResponse.json(client, { status: 201 })
}
