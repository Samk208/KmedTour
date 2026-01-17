import { z } from 'zod'

export const testimonialSchema = z.object({
  id: z.string(),
  name: z.string(),
  country: z.string(),
  countryCode: z.string(),
  treatment: z.string(),
  quote: z.string(),
  rating: z.number().int(),
  date: z.string(),
})

export type Testimonial = z.infer<typeof testimonialSchema>
