/**
 * Validates that required production env vars are set when building on
 * Netlify or CI. Skips entirely during lint, typecheck, dev, and local
 * builds so the validation only fires for the deploy-bound build.
 *
 * Returns { ok, missing } so callers can decide whether to throw, warn,
 * or render. Pure function — easy to test, no side effects.
 */
export function validateProductionEnv(env) {
  if (env.KMEDTOUR_SKIP_ENV_VALIDATION === '1') {
    return { ok: true, missing: [] }
  }

  // NEXT_PHASE is set to 'phase-production-build' only during `next build`.
  // It is NOT set during `next lint`, `next dev`, or unit tests. Gating on
  // this prevents validation from firing during the GitHub Actions lint job.
  if (env.NEXT_PHASE !== 'phase-production-build') {
    return { ok: true, missing: [] }
  }

  // Only enforce on the actual deploy-bound builds (Netlify or CI).
  if (env.NETLIFY !== 'true' && env.CI !== 'true') {
    return { ok: true, missing: [] }
  }

  // NEXT_PUBLIC_APP_URL is intentionally NOT in this list — next.config.mjs
  // resolves it to a default at build time, so absence is not a hard error.
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'RESEND_API_KEY',
  ]

  const missing = required.filter((key) => !env[key])

  // RAG embedding accepts either canonical Gemini key name.
  if (!env.GEMINI_API_KEY && !env.GOOGLE_API_KEY) {
    missing.push('GEMINI_API_KEY (or GOOGLE_API_KEY)')
  }

  return { ok: missing.length === 0, missing }
}
