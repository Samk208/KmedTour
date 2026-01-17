'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCountriesQuery } from '@/lib/api/hooks/use-countries'
import { ArrowRight, Clock, CreditCard, Plane } from 'lucide-react'
import Link from 'next/link'

export default function CountriesPage() {
  const {
    data: countries = [],
    isLoading,
    isError,
  } = useCountriesQuery()

  const renderCountries = () => {
    if (isLoading) {
      return (
        <div className="col-span-full text-center py-16">
          <p className="text-base" style={{ color: 'var(--deep-grey)' }}>
            Loading countries...
          </p>
        </div>
      )
    }

    if (isError) {
      return (
        <div className="col-span-full text-center py-16">
          <p className="text-base" style={{ color: 'var(--kmed-navy)' }}>
            We couldn’t load country guides right now. Please try again shortly.
          </p>
        </div>
      )
    }

    if (countries.length === 0) {
      return (
        <div className="col-span-full text-center py-16">
          <p className="text-base" style={{ color: 'var(--kmed-navy)' }}>
            No country guides available yet.
          </p>
        </div>
      )
    }

    return countries.map((country) => (
      <Card key={country.id} className="p-8 hover:shadow-xl transition-shadow bg-white border-[var(--border-grey)]">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <span className="text-5xl">{country.flag}</span>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
                {country.name}
              </h2>
              <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>
                {country.region ?? '—'}
              </p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-4 py-4 border-y" style={{ borderColor: 'var(--border-grey)' }}>
            <div className="text-center">
              <CreditCard className="h-5 w-5 mx-auto mb-2" style={{ color: 'var(--kmed-teal)' }} />
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--kmed-navy)' }}>
                Visa Cost
              </div>
              <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>
                {country.visaInfo?.cost ?? '—'}
              </div>
            </div>
            <div className="text-center">
              <Clock className="h-5 w-5 mx-auto mb-2" style={{ color: 'var(--kmed-teal)' }} />
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--kmed-navy)' }}>
                Processing
              </div>
              <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>
                {country.visaInfo?.processingTime ?? '—'}
              </div>
            </div>
            <div className="text-center">
              <Plane className="h-5 w-5 mx-auto mb-2" style={{ color: 'var(--kmed-teal)' }} />
              <div className="text-xs font-semibold mb-1" style={{ color: 'var(--kmed-navy)' }}>
                Flight Time
              </div>
              <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>
                {country.travelInfo?.flightDuration ?? '—'}
              </div>
            </div>
          </div>

          {/* Common Treatments */}
          <div>
            <div className="text-sm font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
              Popular Treatments:
            </div>
            <div className="flex flex-wrap gap-2">
              {(country.commonTreatments ?? []).map((treatment) => (
                <span
                  key={treatment}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: 'var(--soft-grey)', color: 'var(--deep-grey)' }}
                >
                  {treatment}
                </span>
              ))}
            </div>
          </div>

          <Link href={`/content/countries/${country.slug}`}>
            <Button 
              className="w-full bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
            >
              View Full Guide
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Card>
    ))
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--soft-grey)' }}>
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
            Country Travel Guides
          </h1>
          <p className="text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--deep-grey)' }}>
            Find visa requirements, flight information, and travel tips specific to your country.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {renderCountries()}
        </div>
      </div>
    </div>
  )
}
