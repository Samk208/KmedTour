import { describe, it, expect } from 'vitest'
import {
  patientIntakeStep1Schema,
  patientIntakeStep2Schema,
  patientIntakeStep3Schema,
  fullPatientIntakeSchema,
} from '@/lib/schemas/patient-intake'

describe('patientIntakeStep1Schema', () => {
  const valid = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+12125551234',
    country: 'US',
    preferredLanguage: 'en' as const,
  }

  it('accepts valid step 1 data', () => {
    expect(patientIntakeStep1Schema.safeParse(valid).success).toBe(true)
  })

  it('rejects short phone number', () => {
    expect(patientIntakeStep1Schema.safeParse({ ...valid, phone: '123' }).success).toBe(false)
  })

  it('rejects unsupported language', () => {
    expect(patientIntakeStep1Schema.safeParse({ ...valid, preferredLanguage: 'de' }).success).toBe(false)
  })
})

describe('patientIntakeStep2Schema', () => {
  const valid = {
    treatmentType: 'dental-implants',
    medicalCondition: 'Missing tooth from accident, looking for implant options',
    urgency: 'within-3-months' as const,
    hasInsurance: false,
  }

  it('accepts valid step 2 data', () => {
    expect(patientIntakeStep2Schema.safeParse(valid).success).toBe(true)
  })

  it('rejects short medicalCondition', () => {
    expect(patientIntakeStep2Schema.safeParse({ ...valid, medicalCondition: 'Short' }).success).toBe(false)
  })

  it('rejects invalid urgency value', () => {
    expect(patientIntakeStep2Schema.safeParse({ ...valid, urgency: 'tomorrow' }).success).toBe(false)
  })
})

describe('patientIntakeStep3Schema', () => {
  const valid = {
    budget: '5000-10000' as const,
    travelDates: 'flexible' as const,
    accommodation: 'clinic-arranged' as const,
    agreeToTerms: true,
  }

  it('accepts valid step 3 data', () => {
    expect(patientIntakeStep3Schema.safeParse(valid).success).toBe(true)
  })

  it('rejects agreeToTerms=false', () => {
    expect(patientIntakeStep3Schema.safeParse({ ...valid, agreeToTerms: false }).success).toBe(false)
  })

  it('rejects invalid budget range', () => {
    expect(patientIntakeStep3Schema.safeParse({ ...valid, budget: 'free' }).success).toBe(false)
  })
})

describe('fullPatientIntakeSchema', () => {
  const valid = {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+12125551234',
    country: 'US',
    preferredLanguage: 'en' as const,
    treatmentType: 'dental-implants',
    medicalCondition: 'Missing tooth from accident, looking for implant options',
    urgency: 'within-3-months' as const,
    hasInsurance: false,
    budget: '5000-10000' as const,
    travelDates: 'flexible' as const,
    accommodation: 'clinic-arranged' as const,
    agreeToTerms: true,
  }

  it('accepts a fully valid intake form', () => {
    expect(fullPatientIntakeSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects partial data', () => {
    expect(fullPatientIntakeSchema.safeParse({ fullName: 'John' }).success).toBe(false)
  })
})
