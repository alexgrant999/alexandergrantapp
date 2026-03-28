import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const { token, returnPath } = await req.json()

    const client = await prisma.client.findUnique({ where: { portalToken: token } })
    if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!client.stripeCustomerId) return NextResponse.json({ error: 'No billing account' }, { status: 400 })

    const session = await stripe.billingPortal.sessions.create({
      customer: client.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${token}${returnPath ?? ''}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    console.error('billing-portal error:', e)
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 })
  }
}
