import { NextResponse } from 'next/server'
import { updateInvoiceStatus } from '@/lib/services/invoices'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await updateInvoiceStatus(id, 'PAID', { paidAt: new Date() })
  return NextResponse.json({ ok: true })
}
