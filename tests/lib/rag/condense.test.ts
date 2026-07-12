import { describe, it, expect } from 'vitest'
import { condenseForRetrieval } from '@/lib/rag/condense'

describe('condenseForRetrieval', () => {
  it('returns the message unchanged when there is no history', () => {
    expect(condenseForRetrieval('How much is rhinoplasty?', [])).toBe('How much is rhinoplasty?')
  })

  it('folds the previous user turn into the query so pronouns resolve', () => {
    const out = condenseForRetrieval('and how long does that one take to recover from?', [
      { role: 'user', content: 'tell me about rhinoplasty' },
      { role: 'assistant', content: 'Rhinoplasty reshapes the nose...' },
    ])
    expect(out).toContain('rhinoplasty')
    expect(out).toContain('how long does that one take to recover from')
  })

  it('only pulls user turns, not assistant turns, into the retrieval query', () => {
    const out = condenseForRetrieval('what about the price?', [
      { role: 'user', content: 'dental implants' },
      { role: 'assistant', content: 'Dental implants replace missing teeth and cost varies.' },
    ])
    expect(out).toContain('dental implants')
    expect(out).not.toContain('replace missing teeth')
  })

  it('caps how much history it folds in (most recent user turns only)', () => {
    const out = condenseForRetrieval('current', [
      { role: 'user', content: 'oldest' },
      { role: 'user', content: 'middle' },
      { role: 'user', content: 'newest' },
    ])
    expect(out).toContain('newest')
    expect(out).toContain('current')
    expect(out).not.toContain('oldest')
  })
})
