/**
 * One-off: onboard Matt Browne / Adventureline as a Client + Project + first invoice.
 *
 *   cd ~/development/alexandergrantapp
 *   npx tsx --env-file=.env.local scripts/onboard-adventureline.ts
 *
 * Idempotent on Client (upserts by email) and Project (by repoName).
 * Invoice is always created fresh (generates next INV-XXX number).
 * Stripe Checkout session in AUD (invoice currency per engagement letter).
 */

import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

async function main() {
  // 1. Matt as Client
  const matt = await prisma.client.upsert({
    where: { email: 'matt@vertigosports.com.au' },
    update: {
      name: 'Matt Browne',
      company: 'Vertigo Sports / Adventureline Clothing Co.',
      notes:
        'Heritage Australian outdoor wear brand (est. 1883). Direct-to-consumer audit engagement Apr–May 2026. Comms via WhatsApp primary, email backup. Connected via SJ (mutual).',
    },
    create: {
      name: 'Matt Browne',
      email: 'matt@vertigosports.com.au',
      company: 'Vertigo Sports / Adventureline Clothing Co.',
      notes:
        'Heritage Australian outdoor wear brand (est. 1883). Direct-to-consumer audit engagement Apr–May 2026. Comms via WhatsApp primary, email backup. Connected via SJ (mutual).',
    },
  })

  // 2. Adventureline Audit Project
  const project = await prisma.project.upsert({
    where: { repoName: 'adventureline' },
    update: {
      clientId: matt.id,
      status: 'ACTIVE',
      budget: new Decimal(2000),
    },
    create: {
      clientId: matt.id,
      name: 'Adventureline Audit',
      description:
        'Phase 1 audit: Shopify, GA4, Meta Pixel, Mailchimp, Judge.me schema, Google Business Profile, Google Shopping / Merchant Center, Search Console, site fundamentals, social distribution. Findings + Phase 2 scope deliverable early May 2026.',
      repoName: 'adventureline',
      status: 'ACTIVE',
      budget: new Decimal(2000),
      startDate: new Date(),
    },
  })

  // 3. Invoice — 50% deposit
  const invoiceCount = await prisma.invoice.count()
  const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(3, '0')}`
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 7)

  const invoice = await prisma.invoice.create({
    data: {
      clientId: matt.id,
      projectId: project.id,
      number: invoiceNumber,
      dueDate,
      subtotal: new Decimal(1000),
      tax: new Decimal(0),
      total: new Decimal(1000),
      notes:
        'Phase 1 Audit — 50% deposit of AUD $2,000 GST inclusive total. Remaining 50% invoiced on findings delivery.',
      items: {
        create: [
          {
            description:
              'Adventureline audit — Phase 1 deposit (50% of AUD $2,000 GST inclusive)',
            quantity: new Decimal(1),
            rate: new Decimal(1000),
            amount: new Decimal(1000),
          },
        ],
      },
    },
    include: { items: true, client: true },
  })

  // 4. Stripe Checkout Session — AUD
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: matt.email,
    line_items: [
      {
        price_data: {
          currency: 'aud',
          product_data: {
            name: `Invoice ${invoice.number} — Adventureline Audit (Phase 1 deposit)`,
            description: 'AUD $1,000 GST inclusive — 50% deposit of $2,000 total.',
          },
          unit_amount: 100000, // AUD $1,000 in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${appUrl}/portal/${matt.portalToken}/invoice/${invoice.id}?paid=true`,
    cancel_url: `${appUrl}/portal/${matt.portalToken}/invoice/${invoice.id}`,
    metadata: { invoiceId: invoice.id },
  })

  // 5. Mark invoice SENT + attach Stripe session ID
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { status: 'SENT', stripeSessionId: session.id },
  })

  console.log('\n=== ONBOARDED ===\n')
  console.log(`Client: ${matt.name} (${matt.email})`)
  console.log(`  ID: ${matt.id}`)
  console.log(`  Portal token: ${matt.portalToken}`)
  console.log()
  console.log(`Project: ${project.name}`)
  console.log(`  ID: ${project.id}`)
  console.log(`  Budget: ${project.budget ? `AU$${project.budget.toString()}` : '(unset)'}`)
  console.log(`  Repo: ${project.repoName}`)
  console.log()
  console.log(`Invoice: ${invoice.number}`)
  console.log(`  ID: ${invoice.id}`)
  console.log(`  Total: AUD $${invoice.total.toString()}`)
  console.log(`  Due: ${invoice.dueDate.toDateString()}`)
  console.log(`  Status: SENT`)
  console.log()
  console.log('=== URLS ===')
  console.log()
  console.log(`Stripe Checkout:   ${session.url}`)
  console.log()
  console.log(`Client Portal:     ${appUrl}/portal/${matt.portalToken}`)
  console.log(`Invoice Portal:    ${appUrl}/portal/${matt.portalToken}/invoice/${invoice.id}`)
  console.log(`Admin Dashboard:   ${appUrl}/dashboard/invoices/${invoice.id}`)
  console.log()
}

main()
  .catch((err) => {
    console.error('\n❌ Onboarding failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
