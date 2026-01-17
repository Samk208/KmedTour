import { z } from 'zod'

export const countrySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  region: z.string().optional(),
  flag: z.string().optional(),
  visaInfo: z
    .object({
      required: z.boolean().optional(),
      type: z.string().optional(),
      processingTime: z.string().optional(),
      cost: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  travelInfo: z
    .object({
      directFlights: z.boolean().optional(),
      airlines: z.array(z.string()).optional(),
      flightDuration: z.string().optional(),
      averageFlightCost: z.string().optional(),
    })
    .optional(),
  medicalTourismNotes: z.string().optional(),
  commonTreatments: z.array(z.string()).default([]),
})

export type Country = z.infer<typeof countrySchema>
