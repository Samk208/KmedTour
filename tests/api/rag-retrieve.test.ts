import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/utils/rate-limit', () => ({
  rateLimit: () => async () => null,
}))
vi.mock('@/lib/api/client/supabase', () => ({
  getSupabaseAdminContext: () => ({
    client: {
      rpc: vi.fn().mockResolvedValue({
        data: [
          { title: 'Visa Guide', content: 'C-3-3 details', source_url: '/how-it-works', similarity: 0.8 },
        ],
        error: null,
      }),
    },
  }),
}))
vi.mock('@/lib/rag/embed', () => ({
  geminiEmbed: vi.fn().mockResolvedValue(new Array(768).fill(0)),
}))

import { POST } from '@/app/api/rag/retrieve/route'

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/rag/retrieve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('/api/rag/retrieve (voice tool endpoint)', () => {
  beforeEach(() => vi.clearAllMocks())
  afterEach(() => vi.unstubAllEnvs())

  it('returns an emergency directive instead of content', async () => {
    const res = await POST(makeRequest({ query: 'patient has severe chest pain' }))
    const json = await res.json()
    expect(json.directive?.type).toBe('emergency')
    expect(json.directive?.say).toContain('119')
    expect(json.chunks).toEqual([])
  })

  it('returns a medical-advice directive instead of content', async () => {
    const res = await POST(makeRequest({ query: 'should I get a knee replacement?' }))
    const json = await res.json()
    expect(json.directive?.type).toBe('medical_advice')
    expect(json.chunks).toEqual([])
  })

  it('returns chunks for benign logistics queries', async () => {
    const res = await POST(makeRequest({ query: 'what visa do I need for medical treatment in Korea?' }))
    const json = await res.json()
    expect(json.directive).toBeNull()
    expect(json.chunks).toHaveLength(1)
    expect(json.chunks[0].title).toBe('Visa Guide')
  })

  it('rejects empty queries', async () => {
    const res = await POST(makeRequest({ query: '' }))
    expect(res.status).toBe(400)
  })
})
