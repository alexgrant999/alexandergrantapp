import { prisma } from '@/lib/db/prisma'
import type { PortalData } from '@/types'

export async function getPortalData(token: string): Promise<PortalData | null> {
  const client = await prisma.client.findUnique({
    where: { portalToken: token },
    include: {
      projects: { select: { id: true, name: true, status: true, description: true } },
      invoices: {
        select: { id: true, number: true, status: true, total: true, dueDate: true, issueDate: true },
        orderBy: { issueDate: 'desc' },
      },
      subscriptions: {
        select: { id: true, name: true, amount: true, interval: true, status: true, cancelAtPeriodEnd: true, currentPeriodEnd: true, stripeCheckoutUrl: true, stripeCheckoutSessionId: true, stripeCustomerId: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!client) return null

  return {
    client: { id: client.id, name: client.name, company: client.company, email: client.email },
    projects: client.projects.map(p => ({ ...p, status: p.status.toString() })),
    invoices: client.invoices.map(inv => ({
      id: inv.id,
      number: inv.number,
      status: inv.status.toString(),
      total: inv.total.toString(),
      dueDate: inv.dueDate.toISOString(),
      issueDate: inv.issueDate.toISOString(),
    })),
    subscriptions: client.subscriptions.map(s => ({
      id: s.id,
      name: s.name,
      amount: s.amount.toString(),
      interval: s.interval.toString(),
      status: s.status.toString(),
      cancelAtPeriodEnd: s.cancelAtPeriodEnd,
      currentPeriodEnd: s.currentPeriodEnd ? s.currentPeriodEnd.toISOString() : null,
      stripeCheckoutUrl: s.stripeCheckoutUrl,
      stripeCustomerId: s.stripeCustomerId,
    })),
  }
}
