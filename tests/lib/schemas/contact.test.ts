import { describe, it, expect } from 'vitest'
import { contactSubmissionSchema } from '@/lib/schemas/contact'

describe('contactSubmissionSchema', () => {
  const validPayload = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    message: 'I would like to know more about your dental services.',
  }

  it('accepts a valid contact submission', () => {
    const result = contactSubmissionSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('accepts optional phone and type', () => {
    const result = contactSubmissionSchema.safeParse({
      ...validPayload,
      phone: '+82101234567',
      type: 'patient_contact',
      sourcePage: '/contact',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty fullName', () => {
    const result = contactSubmissionSchema.safeParse({ ...validPayload, fullName: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = contactSubmissionSchema.safeParse({ ...validPayload, email: 'not-email' })
    expect(result.success).toBe(false)
  })

  it('rejects message shorter than 10 characters', () => {
    const result = contactSubmissionSchema.safeParse({ ...validPayload, message: 'Hi' })
    expect(result.success).toBe(false)
  })

  it('rejects missing required fields', () => {
    const result = contactSubmissionSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
