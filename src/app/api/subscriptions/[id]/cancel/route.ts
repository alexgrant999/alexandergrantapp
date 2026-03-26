import { NextResponse } from 'next/server'
import { cancelSubscription } from '@/lib/services/subscriptions'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sub = await cancelSubscription(id)
  return NextResponse.json(sub)
}
