import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

export type AuthResult =
  | { authenticated: true; user: User }
  | { authenticated: false; response: NextResponse }

/**
 * Verify the caller has a valid Supabase session.
 * Call at the top of any API route handler that requires auth.
 *
 * Returns either the authenticated User or a ready-to-return 401 response.
 */
export async function requireAuth(): Promise<AuthResult> {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { success: false, message: 'Authentication required' },
          { status: 401 },
        ),
      }
    }

    return { authenticated: true, user }
  } catch {
    return {
      authenticated: false,
      response: NextResponse.json(
        { success: false, message: 'Authentication service unavailable' },
        { status: 503 },
      ),
    }
  }
}
