import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/patient/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Successful login
            // Check if we need to claim an intake
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.email) {
                // Attempt to claim intake records awaiting this email
                // This calls the secure RPC function we defined in migration 006
                await supabase.rpc('claim_patient_intake', { p_email: user.email })
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/patient/login?message=Auth code error`)
}
