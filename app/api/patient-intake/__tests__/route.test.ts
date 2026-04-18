/**
 * Tests for patient intake API route
 * 
 * Critical paths tested:
 * - Happy path (successful submission)
 * - Supabase client unavailable (fallback to UUID)
 * - Invalid payload
 * - Rate limit exceeded
 */

import { POST } from '../route'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock dependencies
vi.mock('@/lib/api/client/supabase')
vi.mock('@/lib/utils/logger')
vi.mock('@/lib/utils/rate-limit')

describe('POST /api/patient-intake', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * DRY RUN 1: Happy path - successful Supabase insert
   * EXPECTED: Returns success with data.id
   */
  it('should handle successful intake submission with Supabase', async () => {
    const { getSupabaseContext } = await import('@/lib/api/client/supabase')
    
    // Mock Supabase client with successful insert
    vi.mocked(getSupabaseContext).mockReturnValue({
      client: {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: 'test-submission-123' },
                error: null,
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient,
    })

    const request = new NextRequest('http://localhost:3002/api/patient-intake', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        country: 'Nigeria',
        preferredLanguage: 'English',
        treatmentType: 'rhinoplasty',
        medicalCondition: 'Breathing issues and aesthetic',
        previousTreatments: null,
        budget: '5000-10000',
        travelDates: 'flexible',
        accommodation: 'hotel',
        additionalNotes: 'First time abroad',
        agreeToTerms: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.submissionId).toBe('test-submission-123')
  })

  /**
   * DRY RUN 2: Critical - Supabase client unavailable (fallback path)
   * EXPECTED: Returns fallback UUID, logs warning
   * ISSUE: Currently returns success: true, but data not persisted!
   */
  it('should handle Supabase unavailable with fallback UUID', async () => {
    const { getSupabaseContext } = await import('@/lib/api/client/supabase')
    const { logger } = await import('@/lib/utils/logger')

    // Mock Supabase client as null (unavailable)
    vi.mocked(getSupabaseContext).mockReturnValue({ client: null })

    const request = new NextRequest('http://localhost:3002/api/patient-intake', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+2348012345678',
        country: 'Kenya',
        preferredLanguage: 'English',
        treatmentType: 'cosmetic-surgery',
        medicalCondition: 'Wants nose job',
        previousTreatments: null,
        budget: '3000-7000',
        travelDates: 'flexible',
        accommodation: 'hotel',
        additionalNotes: '',
        agreeToTerms: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    // ⚠️ CURRENT BEHAVIOR: success: true (WRONG - data not saved)
    // EXPECTED BEHAVIOR: Should warn about fallback
    expect(response.status).toBe(202) // 202 = Accepted, not fully processed
    expect(data.success).toBe(true)
    expect(data.submissionId).toBeDefined()
    expect(data.warning).toBeDefined() // Should include warning

    // Verify logger was called to alert about fallback
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('fallback'),
      expect.objectContaining({
        email: 'jane@example.com',
      })
    )
  })

  /**
   * DRY RUN 3: Supabase insert fails (error returned)
   * EXPECTED: Returns 503 Service Unavailable, error message
   */
  it('should handle Supabase insert error gracefully', async () => {
    const { getSupabaseContext } = await import('@/lib/api/client/supabase')

    // Mock Supabase client that returns error
    vi.mocked(getSupabaseContext).mockReturnValue({
      client: {
        from: vi.fn().mockReturnValue({
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error('Unique constraint violation'),
              }),
            }),
          }),
        }),
      } as unknown as SupabaseClient,
    })

    const request = new NextRequest('http://localhost:3002/api/patient-intake', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Duplicate User',
        email: 'duplicate@example.com', // Imagine this exists
        phone: '+1234567890',
        country: 'Nigeria',
        preferredLanguage: 'English',
        treatmentType: 'rhinoplasty',
        medicalCondition: '',
        previousTreatments: null,
        budget: '',
        travelDates: 'flexible',
        accommodation: 'hotel',
        additionalNotes: '',
        agreeToTerms: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.success).toBe(false)
    expect(data.message).toBeDefined()
  })

  /**
   * DRY RUN 4: Invalid JSON payload
   * EXPECTED: Returns 400 Bad Request
   */
  it('should handle invalid JSON payload', async () => {
    const request = new NextRequest('http://localhost:3002/api/patient-intake', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Test',
        // Missing required fields
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toContain('Invalid')
  })

  /**
   * DRY RUN 5: Rate limit exceeded
   * EXPECTED: Returns 429 Too Many Requests
   */
  it('should return 429 when rate limit exceeded', async () => {
    const { rateLimit } = await import('@/lib/utils/rate-limit')

    // Mock rate limit middleware to return response
    const rateLimitResponse = new NextResponse('Too many requests', { status: 429 })
    vi.mocked(rateLimit).mockReturnValue(async () => rateLimitResponse)

    const request = new NextRequest('http://localhost:3002/api/patient-intake', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Test',
        email: 'test@example.com',
        phone: '+1234567890',
        country: 'Nigeria',
        preferredLanguage: 'English',
        treatmentType: 'rhinoplasty',
        medicalCondition: '',
        previousTreatments: null,
        budget: '',
        travelDates: 'flexible',
        accommodation: 'hotel',
        additionalNotes: '',
        agreeToTerms: true,
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(429)
  })
})

/**
 * Integration test notes:
 * 
 * To run these tests:
 * npm run test -- app/api/patient-intake/__tests__/route.test.ts
 * 
 * Coverage gaps identified:
 * 1. No test for email delivery confirmation after submission
 * 2. No test for coordinator notification webhook
 * 3. No test for concurrent submissions (race condition)
 * 4. No test for oversized payload (DoS protection)
 * 
 * These should be added before production deployment.
 */
