'use client'

import { ClinicCard } from '@/components/clinics/clinic-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useClinicsQuery } from '@/lib/api/hooks/use-clinics'
import { ArrowUpDown, Search, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function ClinicsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'name'>('rating')
  
  const { data: clinics = [], isLoading } = useClinicsQuery()

  // Extract unique specialties
  const allSpecialties = Array.from(
    new Set(clinics.flatMap((clinic) => clinic.specialties))
  ).sort()

  // Filter clinics
  const filteredClinics = clinics.filter((clinic) => {
    const matchesSearch =
      searchQuery === '' ||
      clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (clinic.shortDescription || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (clinic.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinic.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      )

    const matchesSpecialty =
      selectedSpecialty === 'all' || clinic.specialties.includes(selectedSpecialty)

    return matchesSearch && matchesSpecialty
  })

  // Sort clinics
  const sortedClinics = [...filteredClinics].sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
    if (sortBy === 'reviews') return (b.reviewCount || 0) - (a.reviewCount || 0)
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    return 0
  })

  return (
    <div className="min-h-screen bg-[var(--cloud-white)]">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-[var(--kmed-blue)] to-[var(--kmed-navy)] text-white py-16">
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">
              Explore Trusted Korean Medical Clinics
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Browse our curated network of KAHF/KOIHA-accredited hospitals and specialty clinics, with KmedTour concierge guiding your care
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6 py-12">
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: 'var(--deep-grey)' }}>Loading clinics...</p>
          </div>
        ) : (
        <>
        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: 'var(--deep-grey)' }} />
              <Input
                type="text"
                placeholder="Search by name, specialty, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-5 w-5" style={{ color: 'var(--deep-grey)' }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'reviews' | 'name')}
                className="px-4 py-2 border rounded-lg text-sm"
                style={{ borderColor: 'var(--border-grey)' }}
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            {/* Compare Button */}
            <Link href="/clinics/compare">
              <Button
                variant="outline"
                style={{ borderColor: 'var(--kmed-teal)', color: 'var(--kmed-teal)' }}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Compare Clinics
              </Button>
            </Link>
          </div>

          {/* Specialty Filter Chips */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSpecialty('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedSpecialty === 'all'
                  ? 'text-white'
                  : 'bg-[var(--soft-grey)] hover:bg-[var(--border-grey)]'
              }`}
              style={
                selectedSpecialty === 'all'
                  ? { backgroundColor: 'var(--kmed-blue)' }
                  : { color: 'var(--deep-grey)' }
              }
            >
              All Specialties
            </button>
            {allSpecialties.slice(0, 8).map((specialty) => (
              <button
                key={specialty}
                onClick={() => setSelectedSpecialty(specialty)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedSpecialty === specialty
                    ? 'text-white'
                    : 'bg-[var(--soft-grey)] hover:bg-[var(--border-grey)]'
                }`}
                style={
                  selectedSpecialty === specialty
                    ? { backgroundColor: 'var(--kmed-blue)' }
                    : { color: 'var(--deep-grey)' }
                }
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        {(searchQuery || selectedSpecialty !== 'all') && (
          <div className="mb-6">
            <p className="text-lg" style={{ color: 'var(--deep-grey)' }}>
              Found <span className="font-semibold" style={{ color: 'var(--kmed-blue)' }}>{sortedClinics.length}</span> {sortedClinics.length === 1 ? 'clinic' : 'clinics'}
            </p>
          </div>
        )}

        {/* Clinics Grid */}
        {sortedClinics.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedClinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-2xl font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
              No clinics found
            </h3>
            <p className="mb-6" style={{ color: 'var(--deep-grey)' }}>
              Try adjusting your search or filter criteria
            </p>
            <Button
              onClick={() => {
                setSearchQuery('')
                setSelectedSpecialty('all')
              }}
              style={{ backgroundColor: 'var(--kmed-blue)', color: 'white' }}
            >
              Clear Filters
            </Button>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  )
}
