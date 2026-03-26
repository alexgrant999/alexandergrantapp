import { NextResponse } from 'next/server'
import { getClient, updateClient, deleteClient } from '@/lib/services/clients'
import { clientSchema } from '@/lib/validators/client'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await getClient(id)
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(client)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const parsed = clientSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const client = await updateClient(id, parsed.data)
  return NextResponse.json(client)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteClient(id)
  return NextResponse.json({ ok: true })
}
