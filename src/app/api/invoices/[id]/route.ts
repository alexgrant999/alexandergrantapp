import { NextResponse } from 'next/server'
import { getInvoice, updateInvoice, deleteInvoice } from '@/lib/services/invoices'
import { invoiceSchema } from '@/lib/validators/invoice'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoice = await getInvoice(id)
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(invoice)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const parsed = invoiceSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const invoice = await updateInvoice(id, parsed.data)
  return NextResponse.json(invoice)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteInvoice(id)
  return NextResponse.json({ ok: true })
}
