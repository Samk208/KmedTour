import { z } from 'zod'

export const treatmentSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  shortDescription: z.string(),
  description: z.string(),
  priceRange: z.string(),
  priceNote: z.string().optional(),
  duration: z.string().optional(),
  successRate: z.string().optional(),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
  recoveryTime: z.string().optional(),
  highlights: z.array(z.string()).default([]),
})

export type Treatment = z.infer<typeof treatmentSchema>
