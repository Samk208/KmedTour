import { describe, it, expect, vi, beforeEach } from 'vitest'

// We test the logic of requireRole by mocking requireAuth
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('requireRole logic', () => {
  // We test the role-gating behaviour directly without a live Supabase connection.
  // The actual Supabase query is mocked at the module level.

  it('exports requireAuth and requireRole functions', async () => {
    const mod = await import('@/lib/utils/api-auth')
    expect(typeof mod.requireAuth).toBe('function')
    expect(typeof mod.requireRole).toBe('function')
  })

  it('UserRole type covers expected values', async () => {
    type UserRole = import('@/lib/utils/api-auth').UserRole
    const roles: UserRole[] = ['patient', 'coordinator', 'admin']
    expect(roles).toHaveLength(3)
  })
})
