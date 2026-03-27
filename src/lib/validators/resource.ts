import { z } from 'zod'

export const createResourceSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  submittedBy: z.string().max(100).optional(),
  tags: z.array(z.string()).max(5).optional(),
})
