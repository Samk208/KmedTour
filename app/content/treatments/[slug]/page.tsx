'use client'

import Image from 'next/image'
import { FavoriteButton } from '@/components/shared/favorite-button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTreatmentQuery } from '@/lib/api/hooks/use-treatments'
import { ArrowLeft, ArrowRight, CheckCircle, Clock, DollarSign, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

export default function TreatmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const {
    data: treatment,
    isLoading,
    isError,
  } = useTreatmentQuery(slug)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-base" style={{ color: 'var(--deep-grey)' }}>
          Loading treatment...
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
            We couldn’t load this treatment
          </h1>
          <p className="text-base" style={{ color: 'var(--deep-grey)' }}>
            Please try again in a moment.
          </p>
          <Link href="/content/treatments">
            <Button>Back to Treatments</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!treatment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
            Treatment Not Found
          </h1>
          <Link href="/content/treatments">
            <Button>Back to Treatments</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--soft-grey)' }}>
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <Image
          src={treatment.imageUrl || "/placeholder.svg"}
          alt={treatment.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto max-w-[1240px] px-4 sm:px-6 py-8">
            <Link href="/content/treatments">
              <Button variant="ghost" className="text-white hover:text-white/80 mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Treatments
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'var(--kmed-teal)', color: 'white' }}>
                {treatment.category}
              </div>
              <FavoriteButton
                item={{
                  id: treatment.id,
                  type: 'treatment',
                  title: treatment.title,
                  slug: treatment.slug,
                  category: treatment.category,
                }}
                showLabel
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {treatment.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white border-[var(--border-grey)]">
                <DollarSign className="h-8 w-8 mb-3" style={{ color: 'var(--kmed-blue)' }} />
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--kmed-navy)' }}>
                  Price Range
                </div>
                <div className="text-2xl font-bold mb-2" style={{ color: 'var(--kmed-blue)' }}>
                  {treatment.priceRange}
                </div>
                <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>
                  {treatment.priceNote}
                </div>
              </Card>

              <Card className="p-6 bg-white border-[var(--border-grey)]">
                <Clock className="h-8 w-8 mb-3" style={{ color: 'var(--kmed-teal)' }} />
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--kmed-navy)' }}>
                  Duration
                </div>
                <div className="text-2xl font-bold mb-2" style={{ color: 'var(--kmed-teal)' }}>
                  {treatment.duration}
                </div>
                <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>
                  Total stay required
                </div>
              </Card>

              <Card className="p-6 bg-white border-[var(--border-grey)]">
                <TrendingUp className="h-8 w-8 mb-3" style={{ color: 'var(--success-green)' }} />
                <div className="text-sm font-semibold mb-1" style={{ color: 'var(--kmed-navy)' }}>
                  Success Rate
                </div>
                <div className="text-2xl font-bold mb-2" style={{ color: 'var(--success-green)' }}>
                  {treatment.successRate}
                </div>
                <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>
                  Industry leading
                </div>
              </Card>
            </div>

            {/* Description */}
            <Card className="p-8 bg-white border-[var(--border-grey)]">
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
                About This Treatment
              </h2>
              <p className="text-base leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                {treatment.description}
              </p>
            </Card>

            {/* Highlights */}
            <Card className="p-8 bg-white border-[var(--border-grey)]">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--kmed-navy)' }}>
                Treatment Highlights
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {treatment.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--kmed-teal)' }} />
                    <span className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                      {highlight}
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
                Interested in This Treatment?
              </h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                Get personalized clinic recommendations and pricing estimates for your specific case.
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
                Need Help?
              </h3>
              <div className="space-y-4 text-sm" style={{ color: 'var(--deep-grey)' }}>
                <div>
                  <div className="font-semibold mb-1" style={{ color: 'var(--kmed-navy)' }}>Email</div>
                  <a href="mailto:info@kmedtour.com" style={{ color: 'var(--kmed-blue)' }}>
                    info@kmedtour.com
                  </a>
                </div>
                <div>
                  <div className="font-semibold mb-1" style={{ color: 'var(--kmed-navy)' }}>WhatsApp</div>
                  <a href="https://wa.me/1234567890" style={{ color: 'var(--kmed-blue)' }}>
                    +82 10 1234 5678
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
