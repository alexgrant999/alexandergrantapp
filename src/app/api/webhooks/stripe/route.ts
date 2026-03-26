import Stripe from 'stripe'
import { headers } from 'next/headers'
import { updateInvoiceStatus } from '@/lib/services/invoices'
import { syncSubscriptionFromStripe, activateSubscriptionFromCheckout } from '@/lib/services/subscriptions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const sig = (await headers()).get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode === 'payment') {
        const invoiceId = session.metadata?.invoiceId
        if (invoiceId) {
          await updateInvoiceStatus(invoiceId, 'PAID', { paidAt: new Date() })
        }
      } else if (session.mode === 'subscription' && session.subscription) {
        await activateSubscriptionFromCheckout(session.id, session.subscription as string)
      }
      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const stripeSub = event.data.object as Stripe.Subscription
      try {
        await syncSubscriptionFromStripe(stripeSub.id)
      } catch {
        // subscription may not exist in our DB yet — ignore
      }
      break
    }

    case 'invoice.payment_failed': {
      const inv = event.data.object as Stripe.Invoice
      const subId = inv.parent?.subscription_details?.subscription
      if (subId) {
        try {
          await syncSubscriptionFromStripe(typeof subId === 'string' ? subId : subId.id)
        } catch {
          // ignore
        }
      }
      break
    }
  }

  return new Response('ok')
}
