import { z } from 'zod'

export const africaRegionSchema = z.object({
  name: z.string(),
  code: z.string(),
  region: z.string().optional(),
  tips: z.object({
    visa: z.string().optional(),
    flights: z.string().optional(),
    currency: z.string().optional(),
    languages: z.string().optional(),
    travel: z.string().optional(),
  }),
})

export type AfricaRegion = z.infer<typeof africaRegionSchema>
