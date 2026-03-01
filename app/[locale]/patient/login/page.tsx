import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PatientLoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string; success?: string }>
}) {
    const resolvedParams = await searchParams

    const login = async (formData: FormData) => {
        'use server'
        const email = formData.get('email') as string
        const supabase = await createClient()

        // Magic Link Login
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // This should point to your "Verify" route or Dashboard directly if configured
                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://kmedtour.com'}/auth/callback?next=/patient/dashboard`,
            },
        })

        if (error) {
            return redirect('/patient/login?message=Could not send login link')
        }

        return redirect('/patient/login?success=Check your email for the magic link!')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
            <Card className="w-full max-w-md shadow-lg border-0">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold text-teal-800">Patient Portal</CardTitle>
                    <CardDescription>
                        Enter your email to receive a secure access link. No password required.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={login} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                required
                                className="h-10 border-gray-200"
                            />
                        </div>

                        {resolvedParams.message && (
                            <div className="text-red-500 text-sm text-center">{resolvedParams.message}</div>
                        )}
                        {resolvedParams.success && (
                            <div className="text-green-600 text-sm text-center font-medium bg-green-50 p-3 rounded">
                                {resolvedParams.success}
                            </div>
                        )}

                        <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 h-10 font-medium">
                            Send Magic Link
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-xs text-gray-400">
                        Protected by KmedTour Medical OS™
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
