import { createClient, SupabaseClient } from '@supabase/supabase-js'

let cachedAdmin: SupabaseClient | null = null

export function getSupabaseAdminClient(): SupabaseClient {
  if (cachedAdmin) return cachedAdmin

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error(
      '[supabase-admin] SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY must be set.',
    )
  }

  cachedAdmin = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
  })

  return cachedAdmin
}
