'use client'

import { FavoriteButton } from '@/components/shared/favorite-button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Clinic } from '@/lib/schemas/clinic'
import { ArrowRight, Award, Globe, MapPin, Star, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface ClinicCardProps {
  clinic: Clinic
  variant?: 'default' | 'compact'
}

export function ClinicCard({ clinic, variant = 'default' }: ClinicCardProps) {
  if (variant === 'compact') {
    return (
      <Card className="p-4 hover:shadow-lg transition-shadow duration-300 bg-white border-[var(--border-grey)]">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-[var(--soft-grey)] relative">
            <Image
              src={clinic.imageUrl || "/images/hospitals/default.jpg"}
              alt={clinic.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1 truncate" style={{ color: 'var(--kmed-navy)' }}>
              {clinic.name}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-[var(--warning-yellow)] text-[var(--warning-yellow)]" />
                <span className="text-sm font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                  {clinic.rating || 'N/A'}
                </span>
              </div>
              <span className="text-sm" style={{ color: 'var(--deep-grey)' }}>
                ({clinic.reviewCount || 0} reviews)
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--deep-grey)' }}>
              <MapPin className="h-3 w-3" />
              {clinic.location || 'Location not specified'}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-white border-[var(--border-grey)]">
      <div className="relative h-56 overflow-hidden">
        <Image
          src={clinic.imageUrl || "/images/hospitals/default.jpg"}
          alt={clinic.name}
          fill
          className="object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="px-3 py-1 rounded-full text-xs font-semibold bg-white" style={{ color: 'var(--kmed-blue)' }}>
            {clinic.priceRange || 'Contact for pricing'}
          </div>
          {clinic.accreditations.includes('JCI Accredited') && (
            <div className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--success-green)] text-white">
              JCI
            </div>
          )}
        </div>
        <div className="absolute top-4 left-4">
          <FavoriteButton
            item={{
              id: clinic.id,
              type: 'clinic',
              title: clinic.name,
              slug: clinic.slug,
              category: clinic.specialties[0],
            }}
          />
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
            {clinic.name}
          </h3>
          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--deep-grey)' }}>
            {clinic.shortDescription || 'No description available.'}
          </p>
        </div>

        <div className="flex items-center gap-4 py-3 border-y" style={{ borderColor: 'var(--border-grey)' }}>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-[var(--warning-yellow)] text-[var(--warning-yellow)]" />
            <span className="text-sm font-semibold" style={{ color: 'var(--kmed-navy)' }}>
              {clinic.rating || 'N/A'}
            </span>
            <span className="text-sm" style={{ color: 'var(--deep-grey)' }}>
              ({clinic.reviewCount || 0})
            </span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" style={{ color: 'var(--kmed-teal)' }} />
            <span className="text-sm" style={{ color: 'var(--deep-grey)' }}>
              {clinic.location || 'Location not specified'}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Award className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--kmed-teal)' }} />
            <div className="text-sm" style={{ color: 'var(--deep-grey)' }}>
              <span className="font-medium">Specialties:</span>{' '}
              {clinic.specialties.slice(0, 3).join(', ')}
              {clinic.specialties.length > 3 && ` +${clinic.specialties.length - 3} more`}
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Globe className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--kmed-teal)' }} />
            <div className="text-sm" style={{ color: 'var(--deep-grey)' }}>
              <span className="font-medium">Languages:</span>{' '}
              {clinic.languagesSupported.slice(0, 3).join(', ')}
            </div>
          </div>
          {clinic.successRate && (
            <div className="flex items-start gap-2">
              <Users className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--kmed-teal)' }} />
              <div className="text-sm" style={{ color: 'var(--deep-grey)' }}>
                <span className="font-medium">Success Rate:</span> {clinic.successRate}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Link href={`/hospitals/${clinic.slug}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full"
              style={{ borderColor: 'var(--kmed-blue)', color: 'var(--kmed-blue)' }}
            >
              View Details
            </Button>
          </Link>
          <Link href="/patient-intake">
            <Button
              className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
            >
              Contact
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
