'use client'

import { Button } from '@/components/ui/button'
import { useTestimonialsQuery } from '@/lib/api/hooks/use-testimonials'
import { useTreatmentsQuery } from '@/lib/api/hooks/use-treatments'
import { ArrowRight, Award, Building2, CheckCircle2, ChevronDown, ChevronUp, ClipboardList, DollarSign, Globe, Heart, Microscope, Plane, Search, Shield, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function LandingPage() {
  const { t } = useTranslation('common')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  
  const { data: treatmentsData = [] } = useTreatmentsQuery()
  const { data: testimonialsData = [] } = useTestimonialsQuery()

  const topTreatments = treatmentsData.slice(0, 6)
  const globalTestimonials = testimonialsData.slice(0, 3)

  return (
    <main className="w-full">
      {/* Hero Section */}
      <section className="relative w-full py-20 md:py-32" style={{ backgroundColor: 'var(--cloud-white)' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--kmed-teal)', color: 'white' }}>
                {t('landing.hero.badge')}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance" style={{ color: 'var(--kmed-navy)' }}>
                {t('landing.hero.title')}
              </h1>
              
              <p className="text-lg md:text-xl leading-relaxed max-w-2xl" style={{ color: 'var(--deep-grey)' }}>
                {t('landing.hero.subtitle')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/content/treatments">
                  <Button 
                    size="lg" 
                    className="text-base px-8 py-6 bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
                  >
                    {t('landing.hero.ctaPrimary')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                
                <Link href="/patient-intake">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="text-base px-8 py-6 border-2"
                    style={{ borderColor: 'var(--kmed-blue)', color: 'var(--kmed-blue)' }}
                  >
                    {t('landing.hero.ctaSecondary')}
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-8 pt-8 border-t" style={{ borderColor: 'var(--soft-grey)' }}>
                <div className="space-y-1">
                  <div className="text-3xl font-bold" style={{ color: 'var(--kmed-blue)' }}>5,000+</div>
                  <div className="text-sm" style={{ color: 'var(--deep-grey)' }}>{t('landing.hero.stats.patients')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold" style={{ color: 'var(--kmed-blue)' }}>50+</div>
                  <div className="text-sm" style={{ color: 'var(--deep-grey)' }}>{t('landing.hero.stats.clinics')}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-3xl font-bold" style={{ color: 'var(--kmed-blue)' }}>98%</div>
                  <div className="text-sm" style={{ color: 'var(--deep-grey)' }}>{t('landing.hero.stats.satisfaction')}</div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/modern-medical-clinic-in-korea-with-professional-s.jpg"
                  alt="Korean medical facility"
                  width={600}
                  height={400}
                  className="w-full h-auto"
                />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--kmed-teal)' }}>
                    <CheckCircle2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-lg" style={{ color: 'var(--kmed-navy)' }}>JCI Accredited</div>
                    <div className="text-sm" style={{ color: 'var(--deep-grey)' }}>International Standards</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-20 md:py-32" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--soft-grey)', color: 'var(--kmed-blue)' }}>
              {t('landing.benefits.badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-balance" style={{ color: 'var(--kmed-navy)' }}>
              {t('landing.benefits.title')}
            </h2>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
              {t('landing.benefits.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Microscope, key: 'technology', color: 'var(--kmed-blue)' },
              { icon: Award, key: 'specialists', color: 'var(--kmed-teal)' },
              { icon: Shield, key: 'outcomes', color: 'var(--kmed-blue)' },
              { icon: DollarSign, key: 'pricing', color: 'var(--kmed-teal)' },
              { icon: Globe, key: 'support', color: 'var(--kmed-blue)' },
              { icon: Building2, key: 'accreditation', color: 'var(--kmed-teal)' },
            ].map((benefit, index) => (
              <div 
                key={index} 
                className="p-6 rounded-xl border hover:shadow-lg transition-shadow"
                style={{ borderColor: 'var(--soft-grey)' }}
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${benefit.color}15` }}
                >
                  <benefit.icon className="h-7 w-7" style={{ color: benefit.color }} />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                  {t(`landing.benefits.items.${benefit.key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                  {t(`landing.benefits.items.${benefit.key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Treatments Section */}
      <section className="w-full py-20 md:py-32" style={{ backgroundColor: 'var(--cloud-white)' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--kmed-blue)', color: 'white' }}>
              {t('landing.treatments.badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-balance" style={{ color: 'var(--kmed-navy)' }}>
              {t('landing.treatments.title')}
            </h2>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
              {t('landing.treatments.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {topTreatments.map((treatment) => (
              <Link 
                key={treatment.id}
                href={`/content/treatments/${treatment.slug}`}
                className="block group"
              >
                <div 
                  className="h-full p-6 rounded-xl border bg-white hover:shadow-lg transition-all"
                  style={{ borderColor: 'var(--soft-grey)' }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div 
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: 'var(--kmed-teal)', color: 'white' }}
                      >
                        {treatment.category}
                      </div>
                      <ArrowRight 
                        className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" 
                        style={{ color: 'var(--kmed-blue)' }}
                      />
                    </div>
                    
                    <h3 className="text-xl font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                      {treatment.title}
                    </h3>
                    
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                      {treatment.shortDescription}
                    </p>

                    <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--soft-grey)' }}>
                      <div>
                        <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>{t('landing.treatments.from')}</div>
                        <div className="text-lg font-bold" style={{ color: 'var(--kmed-blue)' }}>
                          {treatment.priceRange.split(' - ')[0]}
                        </div>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--kmed-teal)' }}>
                        {treatment.duration}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link href="/content/treatments">
              <Button 
                size="lg"
                variant="outline"
                className="text-base px-8 py-6 border-2"
                style={{ borderColor: 'var(--kmed-blue)', color: 'var(--kmed-blue)' }}
              >
                {t('landing.treatments.viewAll')}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-20 md:py-32" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--soft-grey)', color: 'var(--kmed-blue)' }}>
              {t('landing.howItWorks.badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-balance" style={{ color: 'var(--kmed-navy)' }}>
              {t('landing.howItWorks.title')}
            </h2>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
              {t('landing.howItWorks.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ClipboardList, key: 'explore', color: 'var(--kmed-blue)' },
              { icon: Search, key: 'matched', color: 'var(--kmed-teal)' },
              { icon: Plane, key: 'plan', color: 'var(--kmed-blue)' },
              { icon: Heart, key: 'care', color: 'var(--kmed-teal)' },
            ].map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center space-y-4">
                {/* Step Number */}
                <div 
                  className="absolute -top-4 -left-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white z-10"
                  style={{ backgroundColor: step.color }}
                >
                  {index + 1}
                </div>

                {/* Icon */}
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${step.color}15` }}
                >
                  <step.icon className="h-8 w-8" style={{ color: step.color }} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                  {t(`landing.howItWorks.steps.${step.key}.title`)}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                  {t(`landing.howItWorks.steps.${step.key}.description`)}
                </p>

                {/* Connector Line (except last) */}
                {index < 3 && (
                  <div 
                    className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5"
                    style={{ backgroundColor: 'var(--soft-grey)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="w-full py-20 md:py-32" style={{ backgroundColor: 'var(--cloud-white)' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="text-center space-y-6">
            <div className="inline-block px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--kmed-teal)', color: 'white' }}>
              {t('landing.global.badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-balance" style={{ color: 'var(--kmed-navy)' }}>
              {t('landing.global.title')}
            </h2>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
              {t('landing.global.subtitle')}
            </p>

            {/* World Icon */}
            <div className="py-12">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full" style={{ backgroundColor: 'var(--kmed-blue)' }}>
                <Globe className="h-16 w-16 text-white" />
              </div>
            </div>

            <p className="text-xl font-semibold" style={{ color: 'var(--kmed-blue)' }}>
              {t('landing.global.regions')}
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-20 md:py-32" style={{ backgroundColor: 'white' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--soft-grey)', color: 'var(--kmed-blue)' }}>
              {t('landing.testimonials.badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-balance" style={{ color: 'var(--kmed-navy)' }}>
              {t('landing.testimonials.title')}
            </h2>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
              {t('landing.testimonials.subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {globalTestimonials.map((testimonial) => (
              <div 
                key={testimonial.id}
                className="p-6 rounded-xl border bg-white"
                style={{ borderColor: 'var(--soft-grey)' }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" style={{ color: 'var(--kmed-teal)' }} />
                  ))}
                </div>

                <p className="text-sm leading-relaxed mb-6 italic" style={{ color: 'var(--deep-grey)' }}>
                  &quot;{testimonial.quote}&quot;
                </p>

                <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'var(--soft-grey)' }}>
                  <div className="h-12 w-12 rounded-full flex items-center justify-center text-xl" style={{ backgroundColor: 'var(--soft-grey)' }}>
                    {testimonial.country === 'Nigeria' && '🇳🇬'}
                    {testimonial.country === 'Ghana' && '🇬🇭'}
                    {testimonial.country === 'Senegal' && '🇸🇳'}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                      {testimonial.name}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>
                      {testimonial.treatment} • {testimonial.country}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-20 md:py-32" style={{ backgroundColor: 'var(--cloud-white)' }}>
        <div className="container mx-auto max-w-[900px] px-4 sm:px-6">
          <div className="text-center space-y-4 mb-16">
            <div className="inline-block px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--kmed-blue)', color: 'white' }}>
              {t('landing.faq.badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-balance" style={{ color: 'var(--kmed-navy)' }}>
              {t('landing.faq.title')}
            </h2>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
              {t('landing.faq.subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            {['q1', 'q2', 'q3', 'q4', 'q5', 'q6'].map((key, index) => (
              <div 
                key={key}
                className="border rounded-xl bg-white overflow-hidden"
                style={{ borderColor: 'var(--soft-grey)' }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-[var(--soft-grey)] transition-colors"
                >
                  <span className="font-semibold text-lg pr-4" style={{ color: 'var(--kmed-navy)' }}>
                    {t(`landing.faq.items.${key}.question`)}
                  </span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--kmed-blue)' }} />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--kmed-blue)' }} />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 pb-5">
                    <p className="leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                      {t(`landing.faq.items.${key}.answer`)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="w-full py-20 md:py-32" style={{ backgroundColor: 'var(--kmed-blue)' }}>
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="text-center space-y-8">
            <div className="inline-block px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white">
              {t('landing.finalCta.badge')}
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-balance text-white">
              {t('landing.finalCta.title')}
            </h2>
            
            <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed text-white/90">
              {t('landing.finalCta.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/patient-intake">
                <Button 
                  size="lg" 
                  className="text-base px-8 py-6 bg-white hover:bg-white/90"
                  style={{ color: 'var(--kmed-blue)' }}
                >
                  {t('landing.finalCta.ctaPrimary')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/content/treatments">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-base px-8 py-6 border-2 border-white text-white hover:bg-white/10"
                >
                  {t('landing.finalCta.ctaSecondary')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
