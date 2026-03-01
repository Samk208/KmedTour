import { DocumentUploader } from '@/components/patient/document-uploader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { Calendar, ChevronRight, FileText, UploadCloud } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function PatientPortalDashboard() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/patient/login')
    }

    // Fetch patient data using the new relationship
    const { data: patient, error } = await supabase
        .from('patient_intakes')
        .select(`
      id, full_name, email,
      journey_state:patient_journey_state(state, last_updated_at),
      quotes(id, total_amount, currency, quote_status, created_at),
      bookings(id, status, procedure_date, hospital_id, procedure_name),
      patient_documents(id, file_name, file_size, created_at, is_verified)
    `)
        .eq('user_id', user.id)
        .single()

    if (!patient || error) {
        // If user exists but no linked patient record, they might need to "claim" it
        // or they are just a generic user.
        return (
            <div className="container mx-auto py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">No Medical Record Found</h1>
                <p className="text-gray-500 mb-8">We couldn&apos;t link your account to a patient file.</p>
                <Button asChild>
                    <Link href="/get-started">Start a New Journey</Link>
                </Button>
            </div>
        )
    }

    const activeQuote = patient.quotes?.find(q => ['READY', 'SENT'].includes(q.quote_status || ''))
    const activeBooking = patient.bookings?.find(b => ['CONFIRMED', 'DEPOSIT_PAID'].includes(b.status || ''))

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <header className="bg-white border-b py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Patient Portal</h1>
                        <p className="text-sm text-gray-500">Welcome back, {patient.full_name}</p>
                    </div>
                    <div className="flex gap-2">
                        <form action="/auth/signout" method="post">
                            <Button variant="outline" size="sm">Sign Out</Button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 space-y-8">

                {/* Status Overview */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="border-l-4 border-l-teal-600">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Current Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-teal-700">
                                {Array.isArray(patient.journey_state)
                                    ? patient.journey_state[0]?.state?.replace('_', ' ')
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    : (patient.journey_state as any)?.state?.replace('_', ' ') || 'New Inquiry'}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                Updated {new Date((Array.isArray(patient.journey_state)
                                    ? patient.journey_state[0]?.last_updated_at
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    : (patient.journey_state as any)?.last_updated_at) || new Date()).toLocaleDateString()}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Next Step</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activeQuote ? (
                                <div className="flex flex-col gap-2">
                                    <span className="font-semibold">Review your Quote</span>
                                    <Button size="sm" asChild className="w-full bg-teal-600 hover:bg-teal-700">
                                        <Link href={`/patient/quotes/${activeQuote.id}`}>View Quote</Link>
                                    </Button>
                                </div>
                            ) : activeBooking ? (
                                <div className="flex flex-col gap-2">
                                    <span className="font-semibold">Prepare for Travel</span>
                                    <Button size="sm" variant="outline" className="w-full">View Itinerary</Button>
                                </div>
                            ) : (
                                <div className="text-gray-600">Waiting for coordinator update...</div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* Quotes Section */}
                {patient.quotes && patient.quotes.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-teal-600" />
                            Your Quotes
                        </h2>
                        <div className="grid gap-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {patient.quotes.map((quote: any) => (
                                <Card key={quote.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div>
                                            <div className="font-medium text-lg">
                                                {quote.currency} {quote.total_amount?.toLocaleString()}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Quote ID: #{quote.id.slice(0, 8)} • {new Date(quote.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant={quote.quote_status === 'ACCEPTED' ? 'default' : 'secondary'}>
                                                {quote.quote_status}
                                            </Badge>
                                            <Button size="icon" variant="ghost" asChild>
                                                <Link href={`/patient/quotes/${quote.id}`}><ChevronRight className="w-4 h-4" /></Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Bookings Section */}
                {patient.bookings && patient.bookings.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-teal-600" />
                            Your Bookings
                        </h2>
                        <div className="grid gap-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {patient.bookings.map((booking: any) => (
                                <Card key={booking.id}>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg">{booking.procedure_name}</h3>
                                                <p className="text-gray-600">{new Date(booking.procedure_date).toLocaleDateString()}</p>
                                            </div>
                                            <Badge>{booking.status.replace('_', ' ')}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                )}

                {/* Document Management Section */}
                <section>
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <UploadCloud className="w-5 h-5 text-teal-600" />
                        Documents
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-base">Upload Medical Records</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DocumentUploader
                                    patientId={patient.id}
                                    existingDocuments={patient.patient_documents}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Required Documents</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="min-w-4 h-4 mt-1 rounded-full border border-gray-300" />
                                    <div>
                                        <p className="font-medium">Medical History Form</p>
                                        <p className="text-gray-500 text-xs">Pending</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="min-w-4 h-4 mt-1 rounded-full border border-gray-300" />
                                    <div>
                                        <p className="font-medium">Recent X-Rays / MRI</p>
                                        <p className="text-gray-500 text-xs">Required for screening</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 text-sm">
                                    <div className="min-w-4 h-4 mt-1 rounded-full border border-gray-300" />
                                    <div>
                                        <p className="font-medium">Passport Copy</p>
                                        <p className="text-gray-500 text-xs">Required for booking</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

            </main>
        </div>
    )
}
