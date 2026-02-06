/**
 * Rate limiting utility for API routes
 * 
 * Implements in-memory rate limiting with sliding window algorithm.
 * For production, consider Redis-based rate limiting for distributed systems.
 */

import { NextResponse } from 'next/server'

interface RateLimitEntry {
  count: number
  resetAtMs: number
  timestamps: number[]
}

class RateLimiter {
  private store: Map<string, RateLimitEntry>
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    this.store = new Map()
    
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Check if request is within rate limit
   * @param key - Unique identifier (IP, user ID, etc.)
   * @param limit - Maximum number of requests
   * @param windowMs - Time window in milliseconds
   * @returns true if allowed, false if rate limited
   */
  check(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now()
    const existing = this.store.get(key)

    // No previous requests or window expired
    if (!existing || existing.resetAtMs <= now) {
      this.store.set(key, {
        count: 1,
        resetAtMs: now + windowMs,
        timestamps: [now],
      })
      return true
    }

    // Remove timestamps outside the sliding window
    existing.timestamps = existing.timestamps.filter(ts => ts > now - windowMs)
    existing.count = existing.timestamps.length

    // Check if limit exceeded
    if (existing.count >= limit) {
      return false
    }

    // Add new request
    existing.timestamps.push(now)
    existing.count += 1
    
    return true
  }

  /**
   * Get remaining requests for a key
   */
  remaining(key: string, limit: number, windowMs: number): number {
    const now = Date.now()
    const existing = this.store.get(key)

    if (!existing || existing.resetAtMs <= now) {
      return limit
    }

    // Count valid requests in current window
    const validTimestamps = existing.timestamps.filter(ts => ts > now - windowMs)
    return Math.max(0, limit - validTimestamps.length)
  }

  /**
   * Get time until rate limit resets
   */
  resetTime(key: string): number {
    const existing = this.store.get(key)
    if (!existing) return 0

    const now = Date.now()
    return Math.max(0, existing.resetAtMs - now)
  }

  /**
   * Clean up expired entries
   */
  private cleanup() {
    const now = Date.now()
    const keysToDelete: string[] = []

    this.store.forEach((entry, key) => {
      if (entry.resetAtMs <= now) {
        keysToDelete.push(key)
      }
    })

    keysToDelete.forEach(key => this.store.delete(key))
  }

  /**
   * Clear all entries (useful for testing)
   */
  clear() {
    this.store.clear()
  }

  /**
   * Stop cleanup interval (useful for cleanup)
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

/**
 * Rate limit configuration presets
 */
export const RateLimitPresets = {
  // Strict: 10 requests per minute
  STRICT: { limit: 10, windowMs: 60_000 },
  
  // Standard: 30 requests per minute
  STANDARD: { limit: 30, windowMs: 60_000 },
  
  // Moderate: 60 requests per minute
  MODERATE: { limit: 60, windowMs: 60_000 },
  
  // Generous: 100 requests per minute
  GENEROUS: { limit: 100, windowMs: 60_000 },
  
  // AI endpoints: 20 requests per minute (expensive operations)
  AI: { limit: 20, windowMs: 60_000 },
  
  // Auth endpoints: 5 attempts per 15 minutes
  AUTH: { limit: 5, windowMs: 15 * 60_000 },
  
  // Payment endpoints: 10 requests per hour
  PAYMENT: { limit: 10, windowMs: 60 * 60_000 },
}

/**
 * Extract client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP from headers
  const headers = request.headers
  const forwarded = headers.get('x-forwarded-for')
  const realIp = headers.get('x-real-ip')
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'
  
  // Could also include user ID if authenticated
  // const userId = getUserIdFromRequest(request)
  // return userId ? `user:${userId}` : `ip:${ip}`
  
  return `ip:${ip}`
}

/**
 * Rate limiting middleware for API routes
 */
export function rateLimit(options: {
  limit: number
  windowMs: number
  keyPrefix?: string
}) {
  return async (request: Request): Promise<NextResponse | null> => {
    const clientId = getClientIdentifier(request)
    const key = options.keyPrefix ? `${options.keyPrefix}:${clientId}` : clientId
    
    const allowed = rateLimiter.check(key, options.limit, options.windowMs)
    
    if (!allowed) {
      const resetTime = rateLimiter.resetTime(key)
      const retryAfter = Math.ceil(resetTime / 1000)
      
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
            'X-RateLimit-Reset': new Date(Date.now() + resetTime).toISOString(),
          },
        }
      )
    }
    
    // Return null to indicate request should proceed
    // Caller can add rate limit headers if needed
    return null
  }
}

/**
 * Helper to add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  key: string,
  limit: number,
  windowMs: number
): NextResponse {
  const remaining = rateLimiter.remaining(key, limit, windowMs)
  const resetTime = rateLimiter.resetTime(key)
  
  response.headers.set('X-RateLimit-Limit', limit.toString())
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', new Date(Date.now() + resetTime).toISOString())
  
  return response
}

export default rateLimiter
