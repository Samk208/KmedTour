/**
 * Rate limiting utility for API routes
 *
 * Uses Upstash Redis for distributed rate limiting on serverless platforms
 * (Netlify, Vercel). Falls back to in-memory when Upstash env vars are absent
 * so local development works without any Redis setup.
 */

import { NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface RateLimitConfig {
  limit: number
  windowMs: number
  keyPrefix?: string
}

// ---------------------------------------------------------------------------
// In-memory implementation (local dev / test fallback)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  timestamps: number[]
  resetAtMs: number
}

class InMemoryRateLimiter {
  private readonly store: Map<string, RateLimitEntry> = new Map()
  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor() {
    if (typeof setInterval !== 'undefined') {
      this.cleanupTimer = setInterval(() => this.cleanup(), 5 * 60_000)
    }
  }

  check(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const entry = this.store.get(key)

    if (!entry || entry.resetAtMs <= now) {
      this.store.set(key, { timestamps: [now], resetAtMs: now + windowMs })
      return true
    }

    entry.timestamps = entry.timestamps.filter(ts => ts > now - windowMs)
    if (entry.timestamps.length >= limit) return false

    entry.timestamps.push(now)
    return true
  }

  remaining(key: string, limit: number, windowMs: number): number {
    const now = Date.now()
    const entry = this.store.get(key)
    if (!entry || entry.resetAtMs <= now) return limit
    const valid = entry.timestamps.filter(ts => ts > now - windowMs).length
    return Math.max(0, limit - valid)
  }

  resetTime(key: string): number {
    const entry = this.store.get(key)
    if (!entry) return 0
    return Math.max(0, entry.resetAtMs - Date.now())
  }

  clear() {
    this.store.clear()
  }

  destroy() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.store) {
      if (entry.resetAtMs <= now) this.store.delete(key)
    }
  }
}

// ---------------------------------------------------------------------------
// Upstash implementation (production)
// ---------------------------------------------------------------------------

type UpstashLimiter = {
  limit: (key: string) => Promise<{ success: boolean; remaining: number; reset: number }>
}

const upstashLimiterCache: Map<string, UpstashLimiter> = new Map()

async function getUpstashLimiter(
  limit: number,
  windowMs: number,
  prefix: string
): Promise<UpstashLimiter | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return null

  const cacheKey = `${prefix}:${limit}:${windowMs}`
  if (upstashLimiterCache.has(cacheKey)) {
    return upstashLimiterCache.get(cacheKey)!
  }

  try {
    const { Redis } = await import('@upstash/redis')
    const { Ratelimit } = await import('@upstash/ratelimit')

    const redis = new Redis({ url, token })
    const windowSec = Math.ceil(windowMs / 1000)

    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix: `kmedtour:rl:${prefix}`,
    })

    upstashLimiterCache.set(cacheKey, limiter)
    return limiter
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Singleton in-memory limiter (exported for tests)
// ---------------------------------------------------------------------------

const rateLimiter = new InMemoryRateLimiter()
export default rateLimiter

// ---------------------------------------------------------------------------
// Rate limit presets
// ---------------------------------------------------------------------------

export const RateLimitPresets = {
  STRICT:    { limit: 10,  windowMs: 60_000 },
  STANDARD:  { limit: 30,  windowMs: 60_000 },
  MODERATE:  { limit: 60,  windowMs: 60_000 },
  GENEROUS:  { limit: 100, windowMs: 60_000 },
  AI:        { limit: 20,  windowMs: 60_000 },
  AUTH:      { limit: 5,   windowMs: 15 * 60_000 },
  PAYMENT:   { limit: 10,  windowMs: 60 * 60_000 },
} as const

// ---------------------------------------------------------------------------
// Client identifier helper
// ---------------------------------------------------------------------------

export function getClientIdentifier(request: Request): string {
  const headers = request.headers
  const forwarded = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() ?? realIp ?? 'unknown'
  return `ip:${ip}`
}

// ---------------------------------------------------------------------------
// Main middleware factory
// ---------------------------------------------------------------------------

export function rateLimit(options: RateLimitConfig) {
  return async (request: Request): Promise<NextResponse | null> => {
    const clientId = getClientIdentifier(request)
    const prefix = options.keyPrefix ?? 'default'
    const key = `${prefix}:${clientId}`

    const upstash = await getUpstashLimiter(options.limit, options.windowMs, prefix)

    if (upstash) {
      // --- Upstash path (production) ---
      const result = await upstash.limit(clientId)

      if (!result.success) {
        const resetMs = result.reset - Date.now()
        const retryAfter = Math.max(1, Math.ceil(resetMs / 1000))

        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            retryAfter,
          },
          {
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': options.limit.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': new Date(result.reset).toISOString(),
            },
          }
        )
      }

      return null
    }

    // --- In-memory fallback (local dev / test) ---
    const allowed = rateLimiter.check(key, options.limit, options.windowMs)

    if (!allowed) {
      const resetMs = rateLimiter.resetTime(key)
      const retryAfter = Math.ceil(resetMs / 1000)

      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': options.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + resetMs).toISOString(),
          },
        }
      )
    }

    return null
  }
}

// ---------------------------------------------------------------------------
// Header helper (kept for backwards compatibility)
// ---------------------------------------------------------------------------

export function addRateLimitHeaders(
  response: NextResponse,
  key: string,
  limit: number,
  windowMs: number
): NextResponse {
  const remaining = rateLimiter.remaining(key, limit, windowMs)
  const resetMs = rateLimiter.resetTime(key)

  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(Date.now() + resetMs).toISOString())

  return response
}
