'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useArticlesQuery } from '@/lib/api/hooks/use-articles'
import { useCountriesQuery } from '@/lib/api/hooks/use-countries'
import { ArrowRight, BookOpen, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function ContentHighlightsSection() {
  const { data: articles = [], isLoading: articlesLoading } = useArticlesQuery()
  const { data: countries = [], isLoading: countriesLoading } = useCountriesQuery()
  
  const featuredArticles = articles.slice(0, 2)
  const featuredCountries = countries.slice(0, 2)
  const isLoading = articlesLoading || countriesLoading

  return (
    <section className="w-full py-20 md:py-32" style={{ backgroundColor: 'var(--soft-grey)' }}>
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-block px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'white', color: 'var(--kmed-blue)' }}>
            Resources & Guides
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-balance" style={{ color: 'var(--kmed-navy)' }}>
            Everything You Need to Know
          </h2>
          <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
            Explore our comprehensive guides, country information, and patient stories.
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>Loading content...</p>
          </div>
        ) : (
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Articles */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5" style={{ color: 'var(--kmed-blue)' }} />
              <h3 className="text-2xl font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                Latest Articles
              </h3>
            </div>
            
            <div className="space-y-4">
              {featuredArticles.map((article) => (
                <Card key={article.id} className="p-6 bg-white hover:shadow-lg transition-shadow border-[var(--border-grey)]">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <Image
                        src={article.imageUrl || "/placeholder.svg"}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="text-xs font-semibold" style={{ color: 'var(--kmed-teal)' }}>
                        {article.category}
                      </div>
                      <h4 className="font-semibold leading-tight" style={{ color: 'var(--kmed-navy)' }}>
                        {article.title}
                      </h4>
                      <p className="text-sm line-clamp-2" style={{ color: 'var(--deep-grey)' }}>
                        {article.excerpt}
                      </p>
                      <Link 
                        href={`/content/articles/${article.slug}`}
                        className="text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                        style={{ color: 'var(--kmed-blue)' }}
                      >
                        Read More <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Link href="/content/articles">
              <Button 
                variant="outline"
                className="w-full border-2"
                style={{ borderColor: 'var(--kmed-blue)', color: 'var(--kmed-blue)' }}
              >
                View All Articles
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Countries */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5" style={{ color: 'var(--kmed-blue)' }} />
              <h3 className="text-2xl font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                Country Guides
              </h3>
            </div>
            
            <div className="space-y-4">
              {featuredCountries.map((country) => (
                <Card key={country.id} className="p-6 bg-white hover:shadow-lg transition-shadow border-[var(--border-grey)]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{country.flag}</span>
                      <div>
                        <h4 className="font-semibold text-lg" style={{ color: 'var(--kmed-navy)' }}>
                          {country.name}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>
                          {country.region}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 py-3 border-t" style={{ borderColor: 'var(--border-grey)' }}>
                      <div>
                        <div className="text-xs font-semibold mb-1" style={{ color: 'var(--kmed-navy)' }}>
                          Visa Required
                        </div>
                        <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>
                          {country.visaInfo?.type || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold mb-1" style={{ color: 'var(--kmed-navy)' }}>
                          Flight Duration
                        </div>
                        <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>
                          {country.travelInfo?.flightDuration || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <Link 
                      href={`/content/countries/${country.slug}`}
                      className="text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                      style={{ color: 'var(--kmed-blue)' }}
                    >
                      View Travel Guide <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            <Link href="/content/countries">
              <Button 
                variant="outline"
                className="w-full border-2"
                style={{ borderColor: 'var(--kmed-blue)', color: 'var(--kmed-blue)' }}
              >
                View All Countries
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
        )}
      </div>
    </section>
  )
}
