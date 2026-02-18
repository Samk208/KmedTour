import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const checks: Record<string, boolean | string> = {
    supabase: false,
    stripe_configured: !!(
      process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    ),
    resend_configured: !!process.env.RESEND_API_KEY,
    app_url_set: !!process.env.NEXT_PUBLIC_APP_URL,
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('contact_submissions').select('id').limit(1)
    checks.supabase = !error
  } catch {
    checks.supabase = false
  }

  const ok = checks.supabase === true
  return NextResponse.json(
    {
      ok,
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: ok ? 200 : 503 }
  )
}
