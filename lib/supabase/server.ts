import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const SUPABASE_AUTH_COOKIE = 'kmedtour-auth-token'

export async function createClient() {
    const cookieStore = await cookies()

    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: false,
                storageKey: SUPABASE_AUTH_COOKIE,
                storage: {
                    getItem: (key: string) => cookieStore.get(key)?.value ?? null,
                    setItem: () => { },
                    removeItem: () => { },
                }
            },
        }
    )
}
