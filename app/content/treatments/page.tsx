'use client'

import Image from 'next/image'
import { TreatmentFinder } from '@/components/content/treatment-finder'
import { FavoriteButton } from '@/components/shared/favorite-button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTreatmentsQuery } from '@/lib/api/hooks/use-treatments'
import { Clock, DollarSign, Search, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

export default function TreatmentsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  const {
    data: treatments = [],
    isLoading,
    isError,
  } = useTreatmentsQuery()

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      treatments
        .map((treatment) => treatment.category)
        .filter((category): category is string => Boolean(category))
    )

    return ['all', ...Array.from(uniqueCategories)]
  }, [treatments])
  
  const filteredTreatments = useMemo(() => {
    let results = treatments

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter((t) => t.category === selectedCategory)
    }

    // Filter by search query (name, description, keywords, category)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      results = results.filter((t) => {
        return (
          t.title.toLowerCase().includes(query) ||
          t.shortDescription.toLowerCase().includes(query) ||
          t.description.toLowerCase().includes(query) ||
          (t.category ?? '').toLowerCase().includes(query) ||
          t.highlights.some((h) => h.toLowerCase().includes(query))
        )
      })
    }

    return results
  }, [selectedCategory, searchQuery, treatments])

  const handleClearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--soft-grey)' }}>
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
            Medical Treatments in Korea
          </h1>
          <p className="text-lg leading-relaxed max-w-3xl" style={{ color: 'var(--deep-grey)' }}>
            Explore comprehensive information about medical procedures, pricing, and success rates at Korean clinics.
          </p>
        </div>

        <div className="mb-12">
          <TreatmentFinder
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            totalResults={filteredTreatments.length}
          />
        </div>

        {/* Treatments Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-base" style={{ color: 'var(--deep-grey)' }}>
              Loading treatments...
            </p>
          </div>
        ) : isError ? (
          <div className="text-center py-16">
            <p className="text-base mb-4" style={{ color: 'var(--kmed-navy)' }}>
              We couldn’t load treatments right now. Please try again shortly.
            </p>
            <Button onClick={handleClearFilters} className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white">
              Clear all filters
            </Button>
          </div>
        ) : filteredTreatments.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--soft-grey)' }}>
              <Search className="h-8 w-8" style={{ color: 'var(--kmed-teal)' }} />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
              No treatments found
            </h3>
            <p className="text-base mb-6" style={{ color: 'var(--deep-grey)' }}>
              Try adjusting your search or filter to find what you&apos;re looking for.
            </p>
            <Button onClick={handleClearFilters} className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white">
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTreatments.map((treatment) => (
              <Card key={treatment.id} className="overflow-hidden hover:shadow-xl transition-shadow bg-white border-[var(--border-grey)]">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={treatment.imageUrl || "/placeholder.svg"}
                    alt={treatment.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold bg-white" style={{ color: 'var(--kmed-blue)' }}>
                    {treatment.category}
                  </div>
                  <div className="absolute top-4 left-4">
                    <FavoriteButton
                      item={{
                        id: treatment.id,
                        type: 'treatment',
                        title: treatment.title,
                        slug: treatment.slug,
                        category: treatment.category,
                      }}
                    />
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                    {treatment.title}
                  </h3>
                  
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                    {treatment.shortDescription}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-4 border-t border-b" style={{ borderColor: 'var(--border-grey)' }}>
                    <div className="text-center">
                      <DollarSign className="h-4 w-4 mx-auto mb-1" style={{ color: 'var(--kmed-teal)' }} />
                      <div className="text-xs font-semibold" style={{ color: 'var(--kmed-navy)' }}>Price</div>
                      <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>{treatment.priceRange?.split('-')[0]}</div>
                    </div>
                    <div className="text-center">
                      <Clock className="h-4 w-4 mx-auto mb-1" style={{ color: 'var(--kmed-teal)' }} />
                      <div className="text-xs font-semibold" style={{ color: 'var(--kmed-navy)' }}>Duration</div>
                      <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>{treatment.duration}</div>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="h-4 w-4 mx-auto mb-1" style={{ color: 'var(--kmed-teal)' }} />
                      <div className="text-xs font-semibold" style={{ color: 'var(--kmed-navy)' }}>Success</div>
                      <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>{treatment.successRate}</div>
                    </div>
                  </div>

                  <Link href={`/content/treatments/${treatment.slug}`}>
                    <Button 
                      className="w-full bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
                    >
                      View Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
