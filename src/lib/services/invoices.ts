import { prisma } from '@/lib/db/prisma'
import type { InvoiceInput } from '@/lib/validators/invoice'
import { Decimal } from '@prisma/client/runtime/library'

export async function getInvoices() {
  return prisma.invoice.findMany({
    include: { client: true, project: true, items: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: { client: true, project: true, items: true },
  })
}

export async function createInvoice(data: InvoiceInput) {
  const count = await prisma.invoice.count()
  const number = `INV-${String(count + 1).padStart(3, '0')}`

  const items = data.items.map(item => {
    const qty = parseFloat(item.quantity)
    const rate = parseFloat(item.rate)
    return {
      description: item.description,
      quantity: new Decimal(qty),
      rate: new Decimal(rate),
      amount: new Decimal(qty * rate),
    }
  })

  const subtotal = items.reduce((sum, item) => sum + Number(item.amount), 0)
  const tax = subtotal * ((data.taxRate ?? 0) / 100)
  const total = subtotal + tax

  return prisma.invoice.create({
    data: {
      clientId: data.clientId,
      projectId: data.projectId || null,
      number,
      dueDate: new Date(data.dueDate),
      subtotal: new Decimal(subtotal),
      tax: new Decimal(tax),
      total: new Decimal(total),
      notes: data.notes,
      items: { create: items },
    },
    include: { items: true, client: true },
  })
}

export async function updateInvoice(id: string, data: InvoiceInput) {
  const items = data.items.map(item => {
    const qty = parseFloat(item.quantity)
    const rate = parseFloat(item.rate)
    return {
      description: item.description,
      quantity: new Decimal(qty),
      rate: new Decimal(rate),
      amount: new Decimal(qty * rate),
    }
  })

  const subtotal = items.reduce((sum, item) => sum + Number(item.amount), 0)
  const tax = subtotal * ((data.taxRate ?? 0) / 100)
  const total = subtotal + tax

  return prisma.$transaction(async (tx) => {
    await tx.invoiceItem.deleteMany({ where: { invoiceId: id } })
    return tx.invoice.update({
      where: { id },
      data: {
        clientId: data.clientId,
        projectId: data.projectId || null,
        dueDate: new Date(data.dueDate),
        subtotal: new Decimal(subtotal),
        tax: new Decimal(tax),
        total: new Decimal(total),
        notes: data.notes,
        items: { create: items },
      },
      include: { items: true, client: true },
    })
  })
}

export async function deleteInvoice(id: string) {
  return prisma.invoice.delete({ where: { id } })
}

export async function updateInvoiceStatus(
  id: string,
  status: string,
  extra?: { stripeSessionId?: string; paidAt?: Date }
) {
  return prisma.invoice.update({
    where: { id },
    data: { status: status as never, ...extra },
  })
}
