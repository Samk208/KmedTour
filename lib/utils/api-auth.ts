import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'patient' | 'coordinator' | 'admin'

export type AuthResult =
  | { authenticated: true; user: User; role: UserRole | null }
  | { authenticated: false; response: NextResponse }

/**
 * Verify the caller has a valid Supabase session.
 * Returns the authenticated User + their role, or a ready-to-return 401 response.
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

    // Fetch user role from user_roles table
    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    return { authenticated: true, user, role: (roleRow?.role as UserRole) ?? null }
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

/**
 * Verify the caller is authenticated AND has one of the required roles.
 * Returns 401 if not authenticated, 403 if authenticated but wrong role.
 *
 * Usage:
 *   const auth = await requireRole('coordinator')
 *   if (!auth.authenticated) return auth.response
 */
export async function requireRole(...roles: UserRole[]): Promise<AuthResult> {
  const auth = await requireAuth()

  if (!auth.authenticated) return auth

  if (!auth.role || !roles.includes(auth.role)) {
    return {
      authenticated: false,
      response: NextResponse.json(
        {
          success: false,
          message: `Access denied. Required role: ${roles.join(' or ')}`,
        },
        { status: 403 },
      ),
    }
  }

  return auth
}
