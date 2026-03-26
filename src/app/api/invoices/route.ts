import { NextResponse } from 'next/server'
import { getInvoices, createInvoice } from '@/lib/services/invoices'
import { invoiceSchema } from '@/lib/validators/invoice'

export async function GET() {
  const invoices = await getInvoices()
  return NextResponse.json(invoices)
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = invoiceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const invoice = await createInvoice(parsed.data)
  return NextResponse.json(invoice, { status: 201 })
}
