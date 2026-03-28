import { prisma } from '@/lib/db/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { BillingInterval, SubscriptionStatus } from '@prisma/client'
import Stripe from 'stripe'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const resend = new Resend(process.env.RESEND_API_KEY)

const INTERVAL_MAP: Record<BillingInterval, { interval: 'month' | 'year'; interval_count: number }> = {
  MONTHLY:   { interval: 'month', interval_count: 1 },
  QUARTERLY: { interval: 'month', interval_count: 3 },
  ANNUALLY:  { interval: 'year',  interval_count: 1 },
}

export async function getSubscriptions() {
  return prisma.subscription.findMany({
    include: { client: true, project: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getSubscription(id: string) {
  return prisma.subscription.findUnique({
    where: { id },
    include: { client: true, project: true },
  })
}

export async function getClientSubscriptions(clientId: string) {
  return prisma.subscription.findMany({
    where: { clientId },
    orderBy: { createdAt: 'desc' },
  })
}

async function getOrCreateStripeCustomer(clientId: string) {
  const client = await prisma.client.findUnique({ where: { id: clientId } })
  if (!client) throw new Error('Client not found')

  if (client.stripeCustomerId) return client.stripeCustomerId

  const customer = await stripe.customers.create({
    email: client.email,
    name: client.name,
    metadata: { clientId },
  })

  await prisma.client.update({
    where: { id: clientId },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}

export async function createSubscription(data: {
  clientId: string
  projectId?: string
  name: string
  amount: string
  interval: BillingInterval
}) {
  const stripeCustomerId = await getOrCreateStripeCustomer(data.clientId)
  const client = await prisma.client.findUnique({ where: { id: data.clientId } })
  if (!client) throw new Error('Client not found')

  const intervalConfig = INTERVAL_MAP[data.interval]

  const price = await stripe.prices.create({
    currency: 'usd',
    unit_amount: Math.round(parseFloat(data.amount) * 100),
    recurring: intervalConfig,
    product_data: { name: data.name },
  })

  const intervalLabel = { MONTHLY: 'month', QUARTERLY: '3 months', ANNUALLY: 'year' }[data.interval]

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscriptions?activated=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscriptions`,
    metadata: { clientId: data.clientId },
  })

  const sub = await prisma.subscription.create({
    data: {
      clientId: data.clientId,
      projectId: data.projectId || null,
      name: data.name,
      amount: new Decimal(data.amount),
      interval: data.interval,
      status: 'PENDING',
      stripeCustomerId,
      stripeCheckoutSessionId: session.id,
      stripeCheckoutUrl: session.url,
    },
    include: { client: true },
  })

  await resend.emails.send({
    from: 'Alexander Grant <alex@alexandergrant.app>',
    to: client.email,
    subject: `Set up your subscription — ${data.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f9f9f9;">
        <h2 style="color: #1a1a2e; margin-bottom: 8px;">${data.name}</h2>
        <p style="color: #666; margin-bottom: 8px;">Hi ${client.name},</p>
        <p style="color: #666; margin-bottom: 32px;">
          Alexander Grant has set up a subscription for you at
          <strong>$${parseFloat(data.amount).toFixed(2)} USD / ${intervalLabel}</strong>.
          Click below to enter your payment details and activate it.
        </p>
        <a href="${session.url}" style="display: inline-block; background: #6c63ff; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1em;">
          Activate Subscription →
        </a>
        <p style="color: #bbb; font-size: 0.8em; margin-top: 32px;">Alexander Grant · alex@alexandergrant.app</p>
      </div>
    `,
  })

  return { ...sub, checkoutUrl: session.url }
}

export async function refreshCheckoutUrl(id: string) {
  const sub = await prisma.subscription.findUnique({ where: { id }, include: { client: true } })
  if (!sub) throw new Error('Subscription not found')
  if (sub.status !== 'PENDING') throw new Error('Subscription is not pending')

  const intervalConfig = INTERVAL_MAP[sub.interval]
  const intervalLabel = { MONTHLY: 'month', QUARTERLY: '3 months', ANNUALLY: 'year' }[sub.interval]

  // Verify customer still exists in Stripe; create new one if not
  let stripeCustomerId = sub.stripeCustomerId
  if (stripeCustomerId) {
    try {
      await stripe.customers.retrieve(stripeCustomerId)
    } catch {
      stripeCustomerId = null
    }
  }
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: sub.client.email,
      name: sub.client.name,
      metadata: { clientId: sub.clientId },
    })
    stripeCustomerId = customer.id
    await prisma.client.update({ where: { id: sub.clientId }, data: { stripeCustomerId } })
    await prisma.subscription.update({ where: { id }, data: { stripeCustomerId } })
  }

  const price = await stripe.prices.create({
    currency: 'usd',
    unit_amount: Math.round(Number(sub.amount) * 100),
    recurring: intervalConfig,
    product_data: { name: sub.name },
  })

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: price.id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscriptions?activated=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscriptions`,
    metadata: { clientId: sub.clientId },
  })

  await prisma.subscription.update({
    where: { id },
    data: { stripeCheckoutSessionId: session.id, stripeCheckoutUrl: session.url },
  })

  await resend.emails.send({
    from: 'Alexander Grant <alex@alexandergrant.app>',
    to: sub.client.email,
    subject: `Set up your subscription — ${sub.name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f9f9f9;">
        <h2 style="color: #1a1a2e; margin-bottom: 8px;">${sub.name}</h2>
        <p style="color: #666; margin-bottom: 8px;">Hi ${sub.client.name},</p>
        <p style="color: #666; margin-bottom: 32px;">
          Here's your updated payment link for your subscription at
          <strong>$${Number(sub.amount).toFixed(2)} USD / ${intervalLabel}</strong>.
        </p>
        <a href="${session.url}" style="display: inline-block; background: #6c63ff; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 1em;">
          Activate Subscription →
        </a>
        <p style="color: #bbb; font-size: 0.8em; margin-top: 32px;">Alexander Grant · alex@alexandergrant.app</p>
      </div>
    `,
  })

  return session.url
}

export async function activateSubscriptionFromCheckout(checkoutSessionId: string, stripeSubscriptionId: string) {
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubscriptionId)
  const item = stripeSub.items.data[0]

  return prisma.subscription.update({
    where: { stripeCheckoutSessionId: checkoutSessionId },
    data: {
      status: 'ACTIVE',
      stripeSubscriptionId,
      currentPeriodStart: new Date(item.current_period_start * 1000),
      currentPeriodEnd: new Date(item.current_period_end * 1000),
    },
  })
}

export async function cancelSubscription(id: string) {
  const sub = await prisma.subscription.findUnique({ where: { id } })
  if (!sub) throw new Error('Subscription not found')

  if (sub.stripeSubscriptionId) {
    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })
  }

  return prisma.subscription.update({
    where: { id },
    data: { cancelAtPeriodEnd: true },
  })
}

export async function syncSubscriptionFromStripe(stripeSubId: string) {
  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId)
  const item = stripeSub.items.data[0]

  const statusMap: Record<string, SubscriptionStatus> = {
    active:   'ACTIVE',
    past_due: 'PAST_DUE',
    canceled: 'CANCELLED',
    paused:   'PAUSED',
  }

  return prisma.subscription.update({
    where: { stripeSubscriptionId: stripeSubId },
    data: {
      status: statusMap[stripeSub.status] ?? 'ACTIVE',
      currentPeriodStart: new Date(item.current_period_start * 1000),
      currentPeriodEnd: new Date(item.current_period_end * 1000),
      cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
    },
  })
}
