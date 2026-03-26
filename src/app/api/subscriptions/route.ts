import { NextResponse } from 'next/server'
import { getSubscriptions, createSubscription } from '@/lib/services/subscriptions'
import { z } from 'zod'
import { BillingInterval } from '@prisma/client'

const schema = z.object({
  clientId:  z.string().min(1),
  projectId: z.string().optional(),
  name:      z.string().min(1),
  amount:    z.string().min(1),
  interval:  z.nativeEnum(BillingInterval),
})

export async function GET() {
  const subs = await getSubscriptions()
  return NextResponse.json(subs)
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const sub = await createSubscription(parsed.data)
  return NextResponse.json(sub, { status: 201 })
}
