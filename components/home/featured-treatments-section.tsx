'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTreatmentsQuery } from '@/lib/api/hooks/use-treatments'
import { motion } from 'framer-motion'
import { ArrowRight, DollarSign, TrendingUp, ScanLine } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export function FeaturedTreatmentsSection() {
  const { data: treatments = [], isLoading, isError } = useTreatmentsQuery()
  const featuredTreatments = treatments.slice(0, 3)
  const { t } = useTranslation('common')

  return (
    <section className="w-full py-20 md:py-32" style={{ backgroundColor: 'var(--soft-grey)' }}>
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-block px-3 py-1 border border-[var(--kmed-blue)] text-[var(--kmed-blue)] text-xs font-mono rounded-sm">
              {t('landing.treatments.badge') || "Find Your Treatment"}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-balance" style={{ color: 'var(--kmed-navy)' }}>
              {t('landing.treatments.title') || "Featured Treatments"}
            </h2>
            <p className="text-lg leading-relaxed max-w-xl" style={{ color: 'var(--deep-grey)' }}>
              {t('landing.treatments.subtitle') || "Explore treatments trusted by thousands of international patients, all performed at verified Korean clinics."}
            </p>
          </div>
          <Link href="/content/treatments">
            <Button variant="link" className="text-[var(--kmed-blue)] font-bold group">
              {t('landing.treatments.viewAll') || "View All Treatments"} <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {isError ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-500">{t('landing.treatments.errorLoading') || "Unable to load treatments. Please try again later."}</p>
          </div>
        ) : isLoading ? (
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-[400px] bg-gray-200 animate-pulse rounded-2xl" />)}
          </div>
        ) : featuredTreatments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>{t('landing.treatments.noProtocols') || "No treatments available at this time. Please check back soon."}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredTreatments.map((treatment, index) => (
              <motion.div
                key={treatment.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group relative overflow-hidden bg-white hover:border-[var(--kmed-teal)] transition-colors duration-300 border h-full flex flex-col">

                  {/* Category Header */}
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 text-xs font-mono text-gray-500">
                    <div className="flex items-center gap-2">
                      <ScanLine className="w-3 h-3" />
                      {(treatment.category || 'General').toUpperCase()}
                    </div>
                    <div className="text-[var(--kmed-teal)] font-bold">
                      {t('landing.treatments.verified') || "✓ VERIFIED"}
                    </div>
                  </div>

                  {/* Image with overlay */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={treatment.imageUrl || "/placeholder.svg"}
                      alt={treatment.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[var(--kmed-navy)]/20 group-hover:bg-transparent transition-colors" />
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-[var(--kmed-navy)] text-white text-xs px-2 py-1 font-bold inline-block">
                        {(treatment.category || 'General').toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col space-y-4">
                    <h3 className="text-xl font-bold font-sans" style={{ color: 'var(--kmed-navy)' }}>
                      {treatment.title}
                    </h3>

                    <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--deep-grey)' }}>
                      {treatment.shortDescription}
                    </p>

                    {/* Data Grid */}
                    <div className="grid grid-cols-2 gap-px bg-gray-100 border border-gray-100 rounded-lg overflow-hidden my-4 text-xs">
                      <div className="bg-white p-3 text-center">
                        <div className="text-gray-400 mb-1 flex items-center justify-center gap-1"><DollarSign className="w-3 h-3" /> {t('landing.treatments.costEst') || "From"}</div>
                        <div className="font-bold text-[var(--kmed-navy)]">{treatment.priceRange.split('-')[0]}</div>
                      </div>
                      <div className="bg-white p-3 text-center">
                        <div className="text-gray-400 mb-1 flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3" /> {t('landing.treatments.success') || "Success Rate"}</div>
                        <div className="font-bold text-[var(--kmed-teal)]">{treatment.successRate}</div>
                      </div>
                    </div>

                    <Link href={`/content/treatments/${treatment.slug}`} className="w-full">
                      <Button
                        variant="outline"
                        className="w-full justify-between group border-gray-200 hover:border-[var(--kmed-teal)] hover:text-[var(--kmed-teal)]"
                      >
                        <span className="text-xs font-medium">{t('landing.treatments.initModule') || "Learn More"}</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

