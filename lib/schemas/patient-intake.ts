import { z } from 'zod'

export const patientIntakeStep1Schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  country: z.string().min(1, 'Please select your country'),
  preferredLanguage: z.enum(['en', 'fr'], {
    required_error: 'Please select a language',
  }),
})

export const patientIntakeStep2Schema = z.object({
  treatmentType: z.string().min(1, 'Please select a treatment type'),
  medicalCondition: z.string().min(10, 'Please describe your condition (minimum 10 characters)'),
  previousTreatments: z.string().optional(),
  urgency: z.enum(['urgent', 'within-1-month', 'within-3-months', 'flexible'], {
    required_error: 'Please select urgency',
  }),
  hasInsurance: z.boolean(),
  insuranceDetails: z.string().optional(),
})

export const patientIntakeStep3Schema = z.object({
  budget: z.enum(['under-5000', '5000-10000', '10000-20000', 'over-20000'], {
    required_error: 'Please select your budget range',
  }),
  travelDates: z.enum(['flexible', 'specific'], {
    required_error: 'Please select travel date flexibility',
  }),
  specificDates: z.string().optional(),
  accommodation: z.enum(['clinic-arranged', 'self-arranged', 'need-help'], {
    required_error: 'Please select accommodation preference',
  }),
  additionalNotes: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
})

export const fullPatientIntakeSchema = z.object({
  ...patientIntakeStep1Schema.shape,
  ...patientIntakeStep2Schema.shape,
  ...patientIntakeStep3Schema.shape,
})

export type PatientIntakeStep1 = z.infer<typeof patientIntakeStep1Schema>
export type PatientIntakeStep2 = z.infer<typeof patientIntakeStep2Schema>
export type PatientIntakeStep3 = z.infer<typeof patientIntakeStep3Schema>
export type FullPatientIntake = z.infer<typeof fullPatientIntakeSchema>
