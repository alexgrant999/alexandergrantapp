import { z } from 'zod'

export const timeEntrySchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  date: z.string().min(1, 'Date is required'),
  hours: z.string().min(1, 'Hours is required'),
  description: z.string().min(1, 'Description is required'),
  billable: z.boolean().default(true),
  hourlyRate: z.string().optional(),
})

export type TimeEntryInput = z.infer<typeof timeEntrySchema>
