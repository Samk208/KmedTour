import { z } from 'zod'

export const contactSubmissionSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5).optional(),
  type: z.string().optional(), // e.g. 'patient_contact' | 'clinic_partner' | 'general'
  message: z.string().min(10),
  sourcePage: z.string().optional(),
})

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>
