import { z } from 'zod'

export const rsvpSchema = z.object({
  name: z.string().trim().min(1, 'Please enter your name').max(80, 'That name is a little long'),
  attending: z.boolean(),
  plusOne: z.boolean().default(false),
})

export type RsvpInput = z.infer<typeof rsvpSchema>
