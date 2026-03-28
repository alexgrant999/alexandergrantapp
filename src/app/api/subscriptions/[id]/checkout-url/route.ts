import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSubscription, refreshCheckoutUrl } from '@/lib/services/subscriptions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sub = await getSubscription(id)
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (sub.status !== 'PENDING') return NextResponse.json({ error: 'Not pending' }, { status: 400 })

    // If we have the URL stored and a session ID, verify it's still open
    if (sub.stripeCheckoutSessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sub.stripeCheckoutSessionId)
        if (session.status === 'open' && session.url) {
          return NextResponse.json({ url: session.url })
        }
      } catch {
        // session expired or not found — fall through
      }
    }

    // Create a fresh checkout session
    const url = await refreshCheckoutUrl(id)
    return NextResponse.json({ url })
  } catch (e) {
    console.error('checkout-url GET error:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const url = await refreshCheckoutUrl(id)
    return NextResponse.json({ url })
  } catch (e) {
    console.error('checkout-url POST error:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 400 })
  }
}
