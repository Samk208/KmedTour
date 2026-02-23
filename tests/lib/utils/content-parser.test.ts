import { describe, it, expect } from 'vitest'
import { getBaseUrl } from '@/lib/utils/content-parser'

describe('getBaseUrl', () => {
  it('returns a valid URL string', () => {
    const url = getBaseUrl()
    expect(typeof url).toBe('string')
    expect(url.length).toBeGreaterThan(0)
  })

  it('does not end with a trailing slash', () => {
    const url = getBaseUrl()
    expect(url.endsWith('/')).toBe(false)
  })
})
