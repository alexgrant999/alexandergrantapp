/**
 * Revert INV-002 (Adventureline deposit) back to DRAFT + clear the test-mode Stripe session ID.
 * After this, go to the production dashboard and click Send/Checkout to generate a LIVE Stripe URL.
 *
 *   cd ~/development/alexandergrantapp
 *   npx tsx --env-file=.env.local scripts/reset-adventureline-invoice.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const matt = await prisma.client.findUnique({
    where: { email: 'matt@vertigosports.com.au' },
  })
  if (!matt) throw new Error('Matt not found')

  const invoices = await prisma.invoice.findMany({
    where: { clientId: matt.id },
    orderBy: { createdAt: 'desc' },
  })

  for (const inv of invoices) {
    if (inv.stripeSessionId?.startsWith('cs_test_')) {
      await prisma.invoice.update({
        where: { id: inv.id },
        data: { status: 'DRAFT', stripeSessionId: null },
      })
      console.log(`Reset ${inv.number} → DRAFT, cleared test Stripe session`)
    } else {
      console.log(`Skipped ${inv.number} (status=${inv.status}, session=${inv.stripeSessionId ?? 'none'})`)
    }
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
