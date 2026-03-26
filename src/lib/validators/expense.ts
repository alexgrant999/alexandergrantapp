import { z } from 'zod'

export const expenseSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  date: z.string().min(1, 'Date is required'),
  amount: z.string().min(1, 'Amount is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['SOFTWARE', 'HARDWARE', 'TRAVEL', 'HOSTING', 'DESIGN', 'MARKETING', 'OTHER']),
  billable: z.boolean().default(true),
})

export type ExpenseInput = z.infer<typeof expenseSchema>
