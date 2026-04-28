import { getSupabaseAdminContext } from '@/lib/api/client/supabase'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, RateLimitPresets } from '@/lib/utils/rate-limit'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const rateLimitResponse = await rateLimit({ ...RateLimitPresets.GENEROUS, keyPrefix: 'health' })(request)
  if (rateLimitResponse) return rateLimitResponse

  const { searchParams } = new URL(request.url)
  const deep = searchParams.get('deep') === '1'
  const healthSecret = process.env.HEALTHCHECK_SECRET

  if (deep) {
    const suppliedSecret = request.headers.get('x-healthcheck-secret')
    const allowed =
      process.env.NODE_ENV !== 'production' ||
      (healthSecret && suppliedSecret === healthSecret)

    if (!allowed) {
      return NextResponse.json(
        { ok: false, message: 'Deep health check is not authorized' },
        { status: 403 },
      )
    }
  }

  const checks: Record<string, boolean | string | number> = {
    supabase_anon: false,
    stripe_configured: !!(
      process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ),
    resend_configured: !!process.env.RESEND_API_KEY,
    service_role_configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    rag_agent_configured: !!process.env.PYTHON_AGENT_URL,
    rag_embedding_configured: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    app_url_set: !!process.env.NEXT_PUBLIC_APP_URL,
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('contact_submissions').select('id').limit(1)
    checks.supabase_anon = !error
  } catch {
    checks.supabase_anon = false
  }

  if (deep) {
    const { client } = getSupabaseAdminContext()
    checks.supabase_admin = false
    checks.rag_chunks = 0

    if (client) {
      try {
        const { error } = await client.from('contact_submissions').select('id').limit(1)
        checks.supabase_admin = !error
      } catch {
        checks.supabase_admin = false
      }

      try {
        const { count, error } = await client
          .from('rag_chunks')
          .select('id', { count: 'exact', head: true })
        checks.rag_chunks = error ? 0 : count ?? 0
      } catch {
        checks.rag_chunks = 0
      }
    }
  }

  const ok = checks.supabase_anon === true && (!deep || checks.supabase_admin === true)
  return NextResponse.json(
    {
      ok,
      mode: deep ? 'deep' : 'shallow',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: ok ? 200 : 503 }
  )
}
