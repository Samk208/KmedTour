import { describe, it, expect } from 'vitest'
import { validateUUID } from '@/lib/utils/validate-params'

describe('validateUUID', () => {
  it('returns null for a valid UUID', () => {
    expect(validateUUID('550e8400-e29b-41d4-a716-446655440000', 'testId')).toBeNull()
  })

  it('returns a 400 response for an invalid UUID', async () => {
    const result = validateUUID('not-a-uuid', 'journeyId')
    expect(result).not.toBeNull()
    expect(result!.status).toBe(400)
    const body = await result!.json()
    expect(body.success).toBe(false)
    expect(body.message).toContain('journeyId')
  })

  it('returns a 400 response for an empty string', async () => {
    const result = validateUUID('', 'bookingId')
    expect(result).not.toBeNull()
    expect(result!.status).toBe(400)
  })

  it('rejects SQL injection attempts', async () => {
    const result = validateUUID("'; DROP TABLE users; --", 'id')
    expect(result).not.toBeNull()
    expect(result!.status).toBe(400)
  })
})
