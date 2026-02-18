import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

// Consistent storage key for all environments
export const SUPABASE_AUTH_COOKIE = 'kmedtour-auth-token'

export async function updateSession(request: NextRequest) {
    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
        return response
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
                storageKey: SUPABASE_AUTH_COOKIE,
                storage: {
                    getItem: (key: string) => request.cookies.get(key)?.value ?? null,
                    setItem: (key: string, value: string) => {
                        // In middleware we cannot write to request.cookies to affect current request for supabase
                        // but we can write to response.cookies for client.
                        request.cookies.set(key, value)
                        response.cookies.set(key, value, {
                            path: '/',
                            sameSite: 'lax',
                            httpOnly: false,
                        })
                    },
                    removeItem: (key: string) => {
                        request.cookies.delete(key)
                        response.cookies.delete(key)
                    },
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (request.nextUrl.pathname.startsWith('/coordinator')) {
        if (request.nextUrl.pathname === '/coordinator/login') {
            if (user) {
                return NextResponse.redirect(new URL('/coordinator', request.url))
            }
            return response
        }

        if (!user) {
            return NextResponse.redirect(new URL('/coordinator/login', request.url))
        }
    }

    return response
}
