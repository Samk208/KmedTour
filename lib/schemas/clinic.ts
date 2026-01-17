import { z } from 'zod'

export const clinicSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  shortDescription: z.string().optional(),
  description: z.string(),
  location: z.string().optional(),
  address: z.string().optional(),
  specialties: z.array(z.string()).default([]),
  accreditations: z.array(z.string()).default([]),
  yearEstablished: z.number().int().optional(),
  internationalPatients: z.string().optional(),
  languagesSupported: z.array(z.string()).default([]),
  priceRange: z.string().optional(),
  rating: z.number().optional(),
  reviewCount: z.number().int().optional(),
  successRate: z.string().optional(),
  imageUrl: z.string().optional(),
  logoUrl: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  facilities: z.array(z.string()).default([]),
  doctors: z
    .array(
      z.object({
        name: z.string(),
        title: z.string().optional(),
        experience: z.string().optional(),
        education: z.string().optional(),
      }),
    )
    .default([]),
})

export type Clinic = z.infer<typeof clinicSchema>
