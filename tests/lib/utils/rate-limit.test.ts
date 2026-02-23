import { describe, it, expect, beforeEach } from 'vitest'
import rateLimiter, { rateLimit, getClientIdentifier, RateLimitPresets } from '@/lib/utils/rate-limit'

function makeRequest(ip: string = '127.0.0.1'): Request {
  return new Request('http://localhost:3002/api/test', {
    headers: { 'x-forwarded-for': ip },
  })
}

describe('getClientIdentifier', () => {
  it('extracts IP from x-forwarded-for', () => {
    const req = makeRequest('1.2.3.4')
    expect(getClientIdentifier(req)).toBe('ip:1.2.3.4')
  })

  it('takes first IP from comma-separated list', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2' },
    })
    expect(getClientIdentifier(req)).toBe('ip:1.1.1.1')
  })

  it('falls back to x-real-ip', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-real-ip': '3.3.3.3' },
    })
    expect(getClientIdentifier(req)).toBe('ip:3.3.3.3')
  })

  it('returns unknown when no IP headers', () => {
    const req = new Request('http://localhost')
    expect(getClientIdentifier(req)).toBe('ip:unknown')
  })
})

describe('in-memory fallback', () => {
  it('uses in-memory rate limiter when Upstash env vars are missing', () => {
    // In test environment, UPSTASH vars are absent → in-memory fallback active
    expect(process.env.UPSTASH_REDIS_REST_URL).toBeUndefined()
    expect(process.env.UPSTASH_REDIS_REST_TOKEN).toBeUndefined()
    expect(typeof rateLimiter.check).toBe('function')
    expect(typeof rateLimiter.remaining).toBe('function')
    expect(typeof rateLimiter.clear).toBe('function')
    expect(typeof rateLimiter.destroy).toBe('function')
  })
})

describe('RateLimiter (in-memory)', () => {
  beforeEach(() => {
    rateLimiter.clear()
  })

  it('allows requests within the limit', () => {
    expect(rateLimiter.check('test-key', 3, 60_000)).toBe(true)
    expect(rateLimiter.check('test-key', 3, 60_000)).toBe(true)
    expect(rateLimiter.check('test-key', 3, 60_000)).toBe(true)
  })

  it('blocks requests exceeding the limit', () => {
    rateLimiter.check('test-key', 2, 60_000)
    rateLimiter.check('test-key', 2, 60_000)
    expect(rateLimiter.check('test-key', 2, 60_000)).toBe(false)
  })

  it('tracks remaining correctly', () => {
    rateLimiter.check('rem-key', 5, 60_000)
    rateLimiter.check('rem-key', 5, 60_000)
    expect(rateLimiter.remaining('rem-key', 5, 60_000)).toBe(3)
  })
})

describe('rateLimit middleware (in-memory fallback)', () => {
  beforeEach(() => {
    rateLimiter.clear()
  })

  it('returns null when under limit', async () => {
    const middleware = rateLimit({ ...RateLimitPresets.STANDARD, keyPrefix: 'test' })
    const result = await middleware(makeRequest())
    expect(result).toBeNull()
  })

  it('returns 429 response when limit exceeded', async () => {
    const middleware = rateLimit({ limit: 1, windowMs: 60_000, keyPrefix: 'strict' })
    await middleware(makeRequest('5.5.5.5'))
    const result = await middleware(makeRequest('5.5.5.5'))
    expect(result).not.toBeNull()
    expect(result!.status).toBe(429)
    const body = await result!.json()
    expect(body.error).toBe('Rate limit exceeded')
  })

  it('uses keyPrefix in rate limit key', async () => {
    const middlewareA = rateLimit({ limit: 1, windowMs: 60_000, keyPrefix: 'route-a' })
    const middlewareB = rateLimit({ limit: 1, windowMs: 60_000, keyPrefix: 'route-b' })
    // exhaust route-a
    await middlewareA(makeRequest('6.6.6.6'))
    const blockedA = await middlewareA(makeRequest('6.6.6.6'))
    // route-b should still be open for same IP
    const allowedB = await middlewareB(makeRequest('6.6.6.6'))
    expect(blockedA?.status).toBe(429)
    expect(allowedB).toBeNull()
  })
})

describe('RateLimitPresets', () => {
  it('has all expected presets', () => {
    const expected = ['STRICT', 'STANDARD', 'MODERATE', 'GENEROUS', 'AI', 'AUTH', 'PAYMENT']
    for (const key of expected) {
      expect(RateLimitPresets).toHaveProperty(key)
      expect((RateLimitPresets as Record<string, unknown>)[key]).toHaveProperty('limit')
      expect((RateLimitPresets as Record<string, unknown>)[key]).toHaveProperty('windowMs')
    }
  })
})
