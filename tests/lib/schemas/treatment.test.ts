import { describe, it, expect } from 'vitest'
import { treatmentSchema } from '@/lib/schemas/treatment'

describe('treatmentSchema', () => {
  const valid = {
    id: 'rhinoplasty',
    slug: 'rhinoplasty',
    title: 'Rhinoplasty (Nose Job)',
    shortDescription: 'Surgical reshaping of the nose.',
    description: 'Full description of rhinoplasty procedure.',
    priceRange: '$3,000 - $8,000',
    highlights: ['Board-certified surgeons', 'KAHF accredited'],
  }

  it('accepts a valid treatment', () => {
    expect(treatmentSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts optional fields when present', () => {
    const result = treatmentSchema.safeParse({
      ...valid,
      duration: '2-3 hours',
      recoveryTime: '7-10 days',
      successRate: '97%',
      category: 'plastic-surgery',
      imageUrl: 'https://example.com/img.jpg',
    })
    expect(result.success).toBe(true)
  })

  it('defaults highlights to empty array', () => {
    const result = treatmentSchema.safeParse({ ...valid, highlights: undefined })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.highlights).toEqual([])
  })

  it('requires id, slug, title, shortDescription, description, priceRange', () => {
    expect(treatmentSchema.safeParse({}).success).toBe(false)
    expect(treatmentSchema.safeParse({ id: 'x' }).success).toBe(false)
  })
})
