import { POST } from '@/app/api/contact/route'
import { getSupabaseAdminContext } from '@/lib/api/client/supabase'
import { rateLimit } from '@/lib/utils/rate-limit'
import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/api/client/supabase', () => ({
  getSupabaseAdminContext: vi.fn(),
}))

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
}))

vi.mock('@/lib/utils/rate-limit', () => ({
  RateLimitPresets: {
    STANDARD: { limit: 30, windowMs: 60_000 },
  },
  rateLimit: vi.fn(),
}))

function contactRequest(body: unknown) {
  return new NextRequest('http://localhost:3002/api/contact', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(rateLimit).mockReturnValue(async () => null)
  })

  it('returns 503 when the admin Supabase client is unavailable', async () => {
    vi.mocked(getSupabaseAdminContext).mockReturnValue({ client: null })

    const response = await POST(contactRequest({
      fullName: 'Patient One',
      email: 'patient@example.com',
      message: 'I need help choosing a hospital.',
      type: 'patient_contact',
    }))
    const data = await response.json()

    expect(response.status).toBe(503)
    expect(data.success).toBe(false)
    expect(data.code).toBe('DATABASE_NOT_CONFIGURED')
    expect(data.errorId).toMatch(/^contact_/)
  })
})
