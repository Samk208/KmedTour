import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Supabase client wrapper for Kmedtour
//
// Design goals:
// - Read configuration from NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
// - Create a single shared Supabase client instance (per server runtime / browser bundle).
// - Fail safely: if env vars are missing or client creation throws, operate in "mock-only" mode
//   by exposing a null client so repositories can fall back to JSON/mocks.

type SupabaseClientLike = SupabaseClient

export interface SupabaseContext {
  client: SupabaseClientLike | null
}

let cachedContext: SupabaseContext | null = null

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
        // This keeps behavior predictable across server/client and avoids accidental
        // coupling to Supabase auth while we are still in mock / shell mode.
        persistSession: false,
      },
    }) as SupabaseClientLike

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

export function isSupabaseConfigured(): boolean {
  const context = getSupabaseContext()
  return context.client !== null
}
