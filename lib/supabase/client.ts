import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export const SUPABASE_AUTH_COOKIE = 'kmedtour-auth-token'

export function createClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: true,
                storageKey: SUPABASE_AUTH_COOKIE,
                storage: {
                    getItem: (key: string) => {
                        if (typeof document === 'undefined') return null
                        const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'))
                        if (match) return match[2]
                        return null
                    },
                    setItem: (key: string, value: string) => {
                        if (typeof document === 'undefined') return
                        document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax`
                    },
                    removeItem: (key: string) => {
                        if (typeof document === 'undefined') return
                        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`
                    }
                }
            }
        }
    )
}
