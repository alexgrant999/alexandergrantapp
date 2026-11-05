import { NextResponse } from 'next/server'
import { updateInvoiceStatus } from '@/lib/services/invoices'
import { hasSession } from '@/lib/auth/session'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await hasSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  await updateInvoiceStatus(id, 'PAID', { paidAt: new Date() })
  return NextResponse.json({ ok: true })
}
