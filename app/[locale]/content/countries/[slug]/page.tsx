'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCountryQuery } from '@/lib/api/hooks/use-countries'
import { ArrowLeft, ArrowRight, CheckCircle, FileText, Plane } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

export default function CountryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const {
    data: country,
    isLoading,
    isError,
  } = useCountryQuery(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-base" style={{ color: 'var(--deep-grey)' }}>
          Loading country guide...
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
            We couldn’t load this country guide
          </h1>
          <p className="text-base" style={{ color: 'var(--deep-grey)' }}>
            Please try again in a moment.
          </p>
          <Link href="/content/countries">
            <Button>Back to Countries</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!country) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
            Country Not Found
          </h1>
          <Link href="/content/countries">
            <Button>Back to Countries</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--soft-grey)' }}>
      {/* Hero */}
      <div className="w-full py-16" style={{ backgroundColor: 'var(--kmed-navy)' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <Link href="/content/countries">
            <Button variant="ghost" className="text-white hover:text-white/80 mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Countries
            </Button>
          </Link>
          <div className="flex items-center gap-6 mb-6">
            <span className="text-7xl">{country.flag}</span>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {country.name}
              </h1>
              <p className="text-xl text-gray-300">{country.region ?? '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Visa Information */}
            <Card className="p-8 bg-white border-[var(--border-grey)]">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-6 w-6" style={{ color: 'var(--kmed-blue)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
                  Visa Information
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                    Visa Type
                  </div>
                  <div className="text-base" style={{ color: 'var(--deep-grey)' }}>
                    {country.visaInfo?.type ?? '—'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                    Processing Time
                  </div>
                  <div className="text-base" style={{ color: 'var(--deep-grey)' }}>
                    {country.visaInfo?.processingTime ?? '—'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                    Cost
                  </div>
                  <div className="text-base" style={{ color: 'var(--deep-grey)' }}>
                    {country.visaInfo?.cost ?? '—'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                    Visa Required
                  </div>
                  <div className="text-base" style={{ color: 'var(--deep-grey)' }}>
                    {country.visaInfo?.required ? 'Yes' : 'No'}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--soft-grey)' }}>
                <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                  Important Notes:
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                  {country.visaInfo?.notes ?? '—'}
                </p>
              </div>
            </Card>

            {/* Travel Information */}
            <Card className="p-8 bg-white border-[var(--border-grey)]">
              <div className="flex items-center gap-3 mb-6">
                <Plane className="h-6 w-6" style={{ color: 'var(--kmed-teal)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
                  Travel Information
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                    Direct Flights
                  </div>
                  <div className="text-base" style={{ color: 'var(--deep-grey)' }}>
                    {country.travelInfo?.directFlights ? 'Available' : 'Not available (connecting flights required)'}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                    Airlines
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(country.travelInfo?.airlines ?? []).map((airline) => (
                      <span
                        key={airline}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: 'var(--soft-grey)', color: 'var(--deep-grey)' }}
                      >
                        {airline}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                      Flight Duration
                    </div>
                    <div className="text-base" style={{ color: 'var(--deep-grey)' }}>
                      {country.travelInfo?.flightDuration ?? '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                      Average Flight Cost
                    </div>
                    <div className="text-base" style={{ color: 'var(--deep-grey)' }}>
                      {country.travelInfo?.averageFlightCost ?? '—'}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Medical Tourism Notes */}
            <Card className="p-8 bg-white border-[var(--border-grey)]">
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
                Medical Tourism for {country.name} Citizens
              </h2>
              <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--deep-grey)' }}>
                {country.medicalTourismNotes ?? '—'}
              </p>

              <div className="text-sm font-semibold mb-3" style={{ color: 'var(--kmed-navy)' }}>
                Popular Treatments:
              </div>
              <div className="space-y-2">
                {(country.commonTreatments ?? []).map((treatment) => (
                  <div key={treatment} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" style={{ color: 'var(--kmed-teal)' }} />
                    <span className="text-sm" style={{ color: 'var(--deep-grey)' }}>
                      {treatment}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-8 bg-white border-[var(--border-grey)]">
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
                Ready to Start?
              </h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                Get personalized clinic recommendations and complete travel support for your medical journey from {country.name}.
              </p>
              <Link href="/patient-intake">
                <Button 
                  className="w-full mb-4 bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
                  size="lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" className="w-full" size="lg">
                  Contact Us
                </Button>
              </Link>
            </Card>

            <Card className="p-6 bg-white border-[var(--border-grey)]">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-grey)' }}>
                  <span className="text-sm" style={{ color: 'var(--deep-grey)' }}>Visa Cost</span>
                  <span className="text-sm" style={{ color: 'var(--kmed-navy)' }}>{country.visaInfo?.cost ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border-grey)' }}>
                  <span className="text-sm" style={{ color: 'var(--deep-grey)' }}>Processing Time</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--kmed-navy)' }}>{country.visaInfo?.processingTime ?? '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'var(--deep-grey)' }}>Flight Duration</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--kmed-navy)' }}>{country.travelInfo?.flightDuration ?? '—'}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
