import { describe, expect, it } from 'vitest'

import { validateProductionEnv } from '@/lib/config/env-validation.mjs'

const fullEnv = {
  NEXT_PHASE: 'phase-production-build',
  NETLIFY: 'true',
  NODE_ENV: 'production',
  NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon',
  SUPABASE_SERVICE_ROLE_KEY: 'service',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test',
  STRIPE_SECRET_KEY: 'sk_test',
  RESEND_API_KEY: 're_test',
  GEMINI_API_KEY: 'gemini',
}

describe('validateProductionEnv', () => {
  it('passes when all required vars are set on Netlify production-build', () => {
    expect(validateProductionEnv(fullEnv)).toEqual({ ok: true, missing: [] })
  })

  it('does NOT validate during next lint or typecheck (NEXT_PHASE is unset)', () => {
    const env = { NETLIFY: 'true', NODE_ENV: 'production', CI: 'true' }
    expect(validateProductionEnv(env)).toEqual({ ok: true, missing: [] })
  })

  it('does NOT validate outside Netlify and CI (e.g., local pnpm build)', () => {
    const env = { NEXT_PHASE: 'phase-production-build', NODE_ENV: 'production' }
    expect(validateProductionEnv(env)).toEqual({ ok: true, missing: [] })
  })

  it('accepts GOOGLE_API_KEY in lieu of GEMINI_API_KEY', () => {
    const { GEMINI_API_KEY: _g, ...rest } = fullEnv
    const env = { ...rest, GOOGLE_API_KEY: 'google' }
    expect(validateProductionEnv(env)).toEqual({ ok: true, missing: [] })
  })

  it('reports missing when SUPABASE_SERVICE_ROLE_KEY is unset', () => {
    const { SUPABASE_SERVICE_ROLE_KEY: _s, ...env } = fullEnv
    const result = validateProductionEnv(env)
    expect(result.ok).toBe(false)
    expect(result.missing).toContain('SUPABASE_SERVICE_ROLE_KEY')
  })

  it('reports missing when neither GEMINI_API_KEY nor GOOGLE_API_KEY is set', () => {
    const { GEMINI_API_KEY: _g, ...env } = fullEnv
    const result = validateProductionEnv(env)
    expect(result.ok).toBe(false)
    expect(result.missing.some((k: string) => k.includes('GEMINI_API_KEY'))).toBe(true)
  })

  it('does NOT require NEXT_PUBLIC_APP_URL (next.config.mjs supplies a default)', () => {
    // NEXT_PUBLIC_APP_URL is intentionally absent from fullEnv. The config
    // resolves it to "http://localhost:3002" if unset, so failing the build on
    // its absence is wrong — and is what bricked Netlify deploy 39d957f.
    expect(validateProductionEnv(fullEnv)).toEqual({ ok: true, missing: [] })
  })

  it('respects KMEDTOUR_SKIP_ENV_VALIDATION=1 escape hatch even with no other vars', () => {
    const env = {
      KMEDTOUR_SKIP_ENV_VALIDATION: '1',
      NEXT_PHASE: 'phase-production-build',
      NETLIFY: 'true',
    }
    expect(validateProductionEnv(env)).toEqual({ ok: true, missing: [] })
  })

  it('reports multiple missing vars in a single result', () => {
    const env = {
      NEXT_PHASE: 'phase-production-build',
      NETLIFY: 'true',
      NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co',
      // everything else missing
    }
    const result = validateProductionEnv(env)
    expect(result.ok).toBe(false)
    expect(result.missing.length).toBeGreaterThan(1)
  })
})
