import { NextResponse } from 'next/server'
import { cancelSubscription } from '@/lib/services/subscriptions'
import { hasSession } from '@/lib/auth/session'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const sub = await cancelSubscription(id)
  return NextResponse.json(sub)
}
