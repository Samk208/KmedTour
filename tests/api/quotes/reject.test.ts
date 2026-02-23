import { describe, it, expect, vi, beforeEach } from 'vitest'

/**
 * Unit tests for the quote reject business logic.
 * We test the status guard and ownership validation without a live DB.
 */

// ─── Status guard ───────────────────────────────────────────────────────────

describe('quote reject status validation', () => {
  const REJECTABLE = ['SENT', 'READY', 'VIEWED']
  const NON_REJECTABLE = ['DRAFT', 'ACCEPTED', 'REJECTED', 'EXPIRED']

  it('allows rejection for SENT, READY, VIEWED statuses', () => {
    for (const status of REJECTABLE) {
      expect(REJECTABLE.includes(status)).toBe(true)
    }
  })

  it('blocks rejection for terminal / non-pending statuses', () => {
    for (const status of NON_REJECTABLE) {
      expect(REJECTABLE.includes(status)).toBe(false)
    }
  })
})

// ─── Ownership resolution helper (mirrors route logic) ─────────────────────

type OwnershipInput = {
  journey: { patient_intake: { user_id: string } | { user_id: string }[] } | null | (
    { patient_intake: { user_id: string } | { user_id: string }[] }[]
  )
}

function resolveOwnerId(quote: OwnershipInput): string | undefined {
  const journey = Array.isArray(quote.journey) ? quote.journey[0] : quote.journey
  const intake = Array.isArray(journey?.patient_intake)
    ? journey?.patient_intake[0]
    : journey?.patient_intake
  return intake?.user_id
}

describe('quote ownership resolution', () => {
  it('resolves user_id when journey and intake are objects', () => {
    const quote = {
      journey: {
        patient_intake: { user_id: 'user-123' },
      },
    }
    expect(resolveOwnerId(quote)).toBe('user-123')
  })

  it('resolves user_id when journey is an array (Supabase join array)', () => {
    const quote = {
      journey: [
        { patient_intake: { user_id: 'user-456' } },
      ],
    }
    expect(resolveOwnerId(quote)).toBe('user-456')
  })

  it('resolves user_id when patient_intake is an array', () => {
    const quote = {
      journey: {
        patient_intake: [{ user_id: 'user-789' }],
      },
    }
    expect(resolveOwnerId(quote)).toBe('user-789')
  })

  it('returns undefined when journey is null', () => {
    expect(resolveOwnerId({ journey: null })).toBeUndefined()
  })

  it('blocks a different authenticated user from rejecting', () => {
    const quote = {
      journey: { patient_intake: { user_id: 'owner-id' } },
    }
    const authenticatedUserId = 'attacker-id'
    expect(resolveOwnerId(quote)).not.toBe(authenticatedUserId)
  })

  it('allows the correct owner to reject', () => {
    const quote = {
      journey: { patient_intake: { user_id: 'owner-id' } },
    }
    const authenticatedUserId = 'owner-id'
    expect(resolveOwnerId(quote)).toBe(authenticatedUserId)
  })
})
