'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useArticlesQuery } from '@/lib/api/hooks/use-articles'
import { useCountriesQuery } from '@/lib/api/hooks/use-countries'
import { useTreatmentsQuery } from '@/lib/api/hooks/use-treatments'
import { ArrowRight, BookOpen, MapPin, Stethoscope } from 'lucide-react'
import Link from 'next/link'

export default function ContentHubPage() {
  const { data: treatments = [], isLoading: treatmentsLoading } = useTreatmentsQuery()
  const { data: countries = [], isLoading: countriesLoading } = useCountriesQuery()
  const { data: articles = [], isLoading: articlesLoading } = useArticlesQuery()

  const featuredTreatments = treatments.slice(0, 3)
  const featuredCountries = countries.slice(0, 3)
  const featuredArticles = articles.slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-20" style={{ backgroundColor: 'var(--kmed-navy)' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-balance">
              Medical Tourism Knowledge Hub
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Comprehensive guides, treatment information, and country-specific resources to help you make informed decisions about your medical journey to Korea.
            </p>
          </div>
        </div>
      </section>

      {/* Treatments Section */}
      <section className="w-full py-16" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--kmed-blue)' }}
              >
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
                  Treatments
                </h2>
                <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>
                  Explore medical procedures available in Korea
                </p>
              </div>
            </div>
            <Link href="/content/treatments">
              <Button variant="ghost" style={{ color: 'var(--kmed-blue)' }}>
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {treatmentsLoading && featuredTreatments.length === 0 && (
              <p className="col-span-full text-sm" style={{ color: 'var(--deep-grey)' }}>
                Loading treatments...
              </p>
            )}
            {featuredTreatments.map((treatment) => (
              <Link key={treatment.id} href={`/content/treatments/${treatment.slug}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-shadow h-full bg-white border-[var(--border-grey)]">
                  <div className="h-48 overflow-hidden relative">
                    <Image
                      src={treatment.imageUrl || "/placeholder.svg"}
                      alt={treatment.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="text-xs font-semibold" style={{ color: 'var(--kmed-teal)' }}>
                      {treatment.category}
                    </div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                      {treatment.title}
                    </h3>
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--deep-grey)' }}>
                      {treatment.shortDescription}
                    </p>
                    <div className="text-sm font-bold" style={{ color: 'var(--kmed-blue)' }}>
                      {treatment.priceRange}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section className="w-full py-16" style={{ backgroundColor: 'var(--soft-grey)' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--kmed-teal)' }}
              >
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
                  Country Guides
                </h2>
                <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>
                  Travel and visa information for your country
                </p>
              </div>
            </div>
            <Link href="/content/countries">
              <Button variant="ghost" style={{ color: 'var(--kmed-teal)' }}>
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {countriesLoading && featuredCountries.length === 0 && (
              <p className="col-span-full text-sm" style={{ color: 'var(--deep-grey)' }}>
                Loading country guides...
              </p>
            )}
            {featuredCountries.map((country) => (
              <Link key={country.id} href={`/content/countries/${country.slug}`}>
                <Card className="p-6 hover:shadow-xl transition-shadow h-full bg-white border-[var(--border-grey)]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{country.flag}</span>
                      <div>
                        <h3 className="text-xl font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                          {country.name}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>
                          {country.region}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t" style={{ borderColor: 'var(--border-grey)' }}>
                      <div>
                        <div className="text-xs font-semibold mb-1" style={{ color: 'var(--kmed-navy)' }}>
                          Visa Type
                        </div>
                        <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>
                          {country.visaInfo?.type}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold mb-1" style={{ color: 'var(--kmed-navy)' }}>
                          Flight Time
                        </div>
                        <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>
                          {country.travelInfo?.flightDuration}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="w-full py-16" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--kmed-blue)' }}
              >
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
                  Articles & Guides
                </h2>
                <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>
                  Expert insights and patient stories
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articlesLoading && featuredArticles.length === 0 && (
              <p className="col-span-full text-sm" style={{ color: 'var(--deep-grey)' }}>
                Loading articles...
              </p>
            )}
            {featuredArticles.map((article) => (
              <Link key={article.id} href={`/content/articles/${article.slug}`}>
                <Card className="overflow-hidden hover:shadow-xl transition-shadow h-full bg-white border-[var(--border-grey)]">
                  <div className="h-48 overflow-hidden relative">
                    <Image
                      src={article.imageUrl || "/placeholder.svg"}
                      alt={article.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="text-xs font-semibold" style={{ color: 'var(--kmed-teal)' }}>
                      {article.category}
                    </div>
                    <h3 className="text-lg font-semibold leading-tight" style={{ color: 'var(--kmed-navy)' }}>
                      {article.title}
                    </h3>
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--deep-grey)' }}>
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--deep-grey)' }}>
                      <span>{article.author}</span>
                      <span>•</span>
                      <span>{article.publishedAt}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
