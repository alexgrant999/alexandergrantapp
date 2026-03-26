import { z } from 'zod'

export const projectSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).default('ACTIVE'),
  budget: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type ProjectInput = z.infer<typeof projectSchema>
