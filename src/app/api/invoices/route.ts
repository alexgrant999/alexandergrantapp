import { NextResponse } from 'next/server'
import { getInvoices, createInvoice } from '@/lib/services/invoices'
import { invoiceSchema } from '@/lib/validators/invoice'
import { hasSession } from '@/lib/auth/session'

export async function GET() {
  if (!(await hasSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const invoices = await getInvoices()
  return NextResponse.json(invoices)
}

export async function POST(req: Request) {
  if (!(await hasSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const parsed = invoiceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const invoice = await createInvoice(parsed.data)
  return NextResponse.json(invoice, { status: 201 })
}
