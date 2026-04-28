import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase client wrapper for Kmedtour
//
// Design goals:
// - Read configuration from NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
// - Create a single shared Supabase client instance (per server runtime / browser bundle).
// - Fail safely: if env vars are missing or client creation throws, operate in "mock-only" mode
//   by exposing a null client so repositories can fall back to JSON/mocks.

export interface SupabaseContext {
  client: SupabaseClient | null
}

let cachedContext: SupabaseContext | null = null
let cachedAdminContext: SupabaseContext | null = null

export function getSupabaseContext(): SupabaseContext {
  if (cachedContext) {
    return cachedContext
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set. Running in mock-only mode.')
    }

    cachedContext = { client: null }
    return cachedContext
  }

  try {
    const client = createClient(url, anonKey, {
      auth: {
        // For this web app we do not rely on persisted Supabase auth sessions yet.
        persistSession: false,
      },
    })

    cachedContext = { client }
    return cachedContext
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[supabase] Failed to create Supabase client. Falling back to mock-only mode.', error)
    }

    cachedContext = { client: null }
    return cachedContext
  }
}

// Server-only: bypasses RLS via service_role. NEVER import from client components
// or pass through to the browser bundle.
export function getSupabaseAdminContext(): SupabaseContext {
  if (cachedAdminContext) {
    return cachedAdminContext
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[supabase] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set. Admin client running in mock-only mode.')
    }

    cachedAdminContext = { client: null }
    return cachedAdminContext
  }

  try {
    const client = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    cachedAdminContext = { client }
    return cachedAdminContext
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[supabase] Failed to create Supabase admin client. Falling back to mock-only mode.', error)
    }

    cachedAdminContext = { client: null }
    return cachedAdminContext
  }
}

export function isSupabaseConfigured(): boolean {
  const context = getSupabaseContext()
  return context.client !== null
}
