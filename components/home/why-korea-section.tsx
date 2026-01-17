'use client'

import { AfricaRegionSelector } from '@/components/shared/africa-region-selector'
import { AfricaRegion } from '@/lib/schemas/africa-region'
import { Award, DollarSign, Globe, Users } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export function WhyKoreaSection() {
  const [selectedCountry, setSelectedCountry] = useState<AfricaRegion | null>(null)

  const benefits = [
    {
      icon: Award,
      title: 'World-Class Quality',
      description: 'JCI-accredited hospitals with the latest medical technology and highly trained specialists.',
      stat: '#1 in Asia',
    },
    {
      icon: DollarSign,
      title: 'Affordable Pricing',
      description: 'Save 40-60% compared to US/Europe without compromising on quality or safety.',
      stat: '50% Savings',
    },
    {
      icon: Users,
      title: 'Expert Specialists',
      description: 'Access to world-renowned doctors with years of specialized training and experience.',
      stat: '10,000+ Doctors',
    },
    {
      icon: Globe,
      title: 'International Standards',
      description: 'English-speaking staff, international patient departments, and global accreditation.',
      stat: '50+ Languages',
    },
  ]

  return (
    <section className="w-full py-20 md:py-32" style={{ backgroundColor: 'white' }}>
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="mb-12 max-w-md mx-auto">
          <AfricaRegionSelector onCountrySelect={setSelectedCountry} />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Image */}
          <div className="order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
              <Image
                src="/modern-korean-hospital-building-with-medical-excel.jpg"
                alt="Korean medical excellence"
                fill
                className="object-cover w-full h-full"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                priority
              />
              
              {/* Overlay Stats */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                <div className="text-white space-y-2">
                  <div className="text-4xl font-bold">Top 10</div>
                  <div className="text-lg">Global Healthcare Destination</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div className="order-1 lg:order-2 space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: 'var(--soft-grey)', color: 'var(--kmed-blue)' }}>
                Why Choose Korea
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-balance" style={{ color: 'var(--kmed-navy)' }}>
                Korea: A Global Leader in Healthcare
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                Korea has become one of the world&apos;s most sought-after medical tourism destinations, 
                combining cutting-edge technology with compassionate care at affordable prices.
              </p>
            </div>

            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-4">
                  <div 
                    className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--kmed-blue)' }}
                  >
                    <benefit.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                        {benefit.title}
                      </h3>
                      <span className="text-sm font-bold" style={{ color: 'var(--kmed-teal)' }}>
                        {benefit.stat}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--deep-grey)' }}>
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedCountry && (
              <div 
                className="p-6 rounded-xl space-y-4"
                style={{ backgroundColor: 'var(--soft-grey)' }}
              >
                <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--kmed-navy)' }}>
                  <span className="text-2xl">{getFlagEmoji(selectedCountry.code)}</span>
                  Travel Tips for {selectedCountry.name}
                </h3>
                <div className="space-y-3 text-sm" style={{ color: 'var(--deep-grey)' }}>
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--kmed-blue)' }}>Visa:</span>{' '}
                    {selectedCountry.tips.visa || 'Contact embassy for details'}
                  </div>
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--kmed-blue)' }}>Flights:</span>{' '}
                    {selectedCountry.tips.flights || 'Multiple flight options available'}
                  </div>
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--kmed-blue)' }}>Currency:</span>{' '}
                    {selectedCountry.tips.currency || 'Exchange to Korean Won'}
                  </div>
                  <div>
                    <span className="font-semibold" style={{ color: 'var(--kmed-blue)' }}>Languages:</span>{' '}
                    {selectedCountry.tips.languages || 'English available'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
