import { z } from 'zod'

export const invoiceItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.string().min(1),
  rate: z.string().min(1),
})

export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  projectId: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
  taxRate: z.number().min(0).max(100).default(0),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
})

export type InvoiceInput = z.infer<typeof invoiceSchema>
