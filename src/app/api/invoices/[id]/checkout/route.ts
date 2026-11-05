import { NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'node:crypto'
import { getInvoice, updateInvoiceStatus } from '@/lib/services/invoices'
import { createCheckoutSession } from '@/lib/services/stripe'
import { hasSession } from '@/lib/auth/session'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoice(id)
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const portalToken = req.headers.get('x-portal-token')
  const portalTokenMatches =
    !!portalToken &&
    timingSafeEqual(
      createHash('sha256').update(portalToken).digest(),
      createHash('sha256').update(invoice.client.portalToken).digest(),
    )
  if (!portalTokenMatches && !(await hasSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = await createCheckoutSession({
    id: invoice.id,
    number: invoice.number,
    total: invoice.total.toString(),
    clientEmail: invoice.client.email,
    clientName: invoice.client.name,
    portalToken: invoice.client.portalToken,
  })

  await updateInvoiceStatus(id, invoice.status, { stripeSessionId: session.id })
  return NextResponse.json({ url: session.url })
}
