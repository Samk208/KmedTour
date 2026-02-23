import { QuoteActions } from '@/components/patient/quote-actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'
import { Building2, ChevronLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function QuoteDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Verify User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/patient/login')

    // Fetch Quote with Details
    // We need to verify this quote belongs to the patient
    const { data: quote, error } = await supabase
        .from('quotes')
        .select(`
        *,
        hospital:hospital_id(name, city, country, overview),
        bookings(id, status)
    `)
        .eq('id', id)
        .single()

    if (error || !quote) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold">Quote Not Found</h1>
                <p className="text-gray-500 mt-2">This quote might not exist or you don&apos;t have permission.</p>
                <Button asChild className="mt-6">
                    <Link href="/patient/dashboard">Return to Dashboard</Link>
                </Button>
            </div>
        )
    }

    // Security check: Match patient_intakes.user_id
    const { data: patient } = await supabase
        .from('patient_intakes')
        .select('id')
        .eq('user_id', user.id)
        .single()

    if (!patient || patient.id !== quote.patient_id) {
        return <div className="p-10 text-center text-red-500">Unauthorized Access</div>
    }

    const booking = quote.bookings && quote.bookings[0] // Assuming one active booking per quote usually

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="bg-white border-b py-4">
                <div className="container mx-auto px-4">
                    <Button variant="ghost" size="sm" asChild className="mb-2 -ml-2 text-gray-500">
                        <Link href="/patient/dashboard"><ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard</Link>
                    </Button>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Medical Journey Quote</h1>
                            <p className="text-sm text-gray-500">Quote ID: #{quote.id.slice(0, 8)}</p>
                        </div>
                        <Badge className="text-sm px-3 py-1" variant={quote.quote_status === 'ACCEPTED' ? 'default' : 'secondary'}>
                            {quote.quote_status}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content: Quote Details */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Hospital Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-teal-600" /> Selected Hospital
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <h3 className="text-xl font-bold mb-1">{quote.hospital?.name}</h3>
                            <p className="text-gray-600 mb-4">{quote.hospital?.city}, {quote.hospital?.country}</p>
                            <p className="text-sm text-gray-500 leading-relaxed">{quote.hospital?.overview}</p>
                        </CardContent>
                    </Card>

                    {/* Inclusions / Exclusions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base text-green-700">Included</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {Array.isArray(quote.includes) && quote.includes.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <ShieldCheck className="w-4 h-4 text-green-600 mt-0.5" /> {item}
                                        </li>
                                    ))}
                                    {(!quote.includes || quote.includes.length === 0) && <li className="text-gray-400">No specific inclusions listed</li>}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base text-red-700">Excluded</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2 text-sm">
                                    {Array.isArray(quote.excludes) && quote.excludes.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-red-400 font-bold text-xs mt-1">✕</span> {item}
                                        </li>
                                    ))}
                                    {(!quote.excludes || quote.excludes.length === 0) && <li className="text-gray-400">No specific exclusions listed</li>}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Terms */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Terms & Conditions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 whitespace-pre-wrap">
                                {quote.terms_and_conditions || 'Standard KmedTour terms apply. Please contact your coordinator for details.'}
                            </p>
                        </CardContent>
                    </Card>

                </div>

                {/* Sidebar: Pricing & Action */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-4 border-2 border-teal-50 shadow-lg">
                        <CardHeader className="bg-gray-50/50 pb-4">
                            <CardTitle>Estimation Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Initial Consultation</span>
                                <span className="font-medium">Included</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Procedure Cost</span>
                                <span className="font-medium">{quote.currency} {quote.total_amount?.toLocaleString()}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-lg font-bold text-teal-900">
                                <span>Total Estimate</span>
                                <span>{quote.currency} {quote.total_amount?.toLocaleString()}</span>
                            </div>

                            {/* Client Component for Actions */}
                            <QuoteActions
                                quoteId={quote.id}
                                bookingId={booking?.id}
                                quoteStatus={quote.quote_status}
                                bookingStatus={booking?.status}
                                totalAmount={quote.total_amount}
                                currency={quote.currency}
                            />

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
