import { NextResponse } from 'next/server'
import { getSubscription } from '@/lib/services/subscriptions'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { BillingInterval } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.string().optional(),
  interval: z.nativeEnum(BillingInterval).optional(),
  notes: z.string().optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sub = await getSubscription(id)
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(sub)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })

  const data: Record<string, unknown> = {}
  if (parsed.data.name) data.name = parsed.data.name
  if (parsed.data.amount) data.amount = new Decimal(parsed.data.amount)
  if (parsed.data.interval) data.interval = parsed.data.interval

  const sub = await prisma.subscription.update({
    where: { id },
    data,
    include: { client: true, project: true },
  })
  return NextResponse.json(sub)
}
