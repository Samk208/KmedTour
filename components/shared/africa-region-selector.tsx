'use client'

import { useAfricaRegionsQuery } from '@/lib/api/hooks/use-africa-regions'
import { AfricaRegion } from '@/lib/schemas/africa-region'
import { Check, Globe } from 'lucide-react'
import { useState } from 'react'

interface AfricaRegionSelectorProps {
  onCountrySelect?: (country: AfricaRegion | null) => void
  className?: string
}

export function AfricaRegionSelector({ onCountrySelect, className }: AfricaRegionSelectorProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const { data: countries = [] } = useAfricaRegionsQuery()

  const handleSelect = (countryCode: string) => {
    const country = countries.find((c) => c.code === countryCode)
    if (country) {
      setSelectedCountry(countryCode)
      onCountrySelect?.(country)
    } else {
      setSelectedCountry(null)
      onCountrySelect?.(null)
    }
    setIsOpen(false)
  }

  const selectedCountryData = countries.find((c) => c.code === selectedCountry)

  return (
    <div className={className}>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 hover:shadow-md bg-white"
          style={{ 
            borderColor: isOpen ? 'var(--kmed-blue)' : 'var(--soft-grey)',
          }}
        >
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" style={{ color: 'var(--kmed-blue)' }} />
            <span 
              className="font-medium text-sm"
              style={{ color: selectedCountry ? 'var(--kmed-navy)' : 'var(--deep-grey)' }}
            >
              {selectedCountryData 
                ? `${getFlagEmoji(selectedCountryData.code)} ${selectedCountryData.name}`
                : 'Select your country'}
            </span>
          </div>
          <svg
            className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--deep-grey)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border-2 max-h-80 overflow-y-auto z-50"
            style={{ borderColor: 'var(--soft-grey)' }}
          >
            <div className="p-2">
              {/* Reset Option */}
              <button
                onClick={() => handleSelect('')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-sm" style={{ color: 'var(--deep-grey)' }}>
                  All countries
                </span>
                {!selectedCountry && (
                  <Check className="h-4 w-4" style={{ color: 'var(--kmed-teal)' }} />
                )}
              </button>

              {/* Country Options */}
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleSelect(country.code)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getFlagEmoji(country.code)}</span>
                    <div>
                      <div className="text-sm font-medium" style={{ color: 'var(--kmed-navy)' }}>
                        {country.name}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>
                        {country.region}
                      </div>
                    </div>
                  </div>
                  {selectedCountry === country.code && (
                    <Check className="h-4 w-4" style={{ color: 'var(--kmed-teal)' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
