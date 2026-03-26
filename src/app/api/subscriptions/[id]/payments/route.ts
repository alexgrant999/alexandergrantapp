import { NextResponse } from 'next/server'
import { getSubscription } from '@/lib/services/subscriptions'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sub = await getSubscription(id)
  if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  if (!sub.stripeSubscriptionId) {
    return NextResponse.json([])
  }

  const invoices = await stripe.invoices.list({
    subscription: sub.stripeSubscriptionId,
    limit: 50,
  })

  const payments = invoices.data.map(inv => ({
    id: inv.id,
    amount: (inv.amount_paid ?? 0) / 100,
    status: inv.status,
    date: inv.created ? new Date(inv.created * 1000).toISOString() : null,
    periodStart: inv.period_start ? new Date(inv.period_start * 1000).toISOString() : null,
    periodEnd: inv.period_end ? new Date(inv.period_end * 1000).toISOString() : null,
    invoiceUrl: inv.hosted_invoice_url,
  }))

  return NextResponse.json(payments)
}
