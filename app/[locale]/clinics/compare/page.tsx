'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useClinicsQuery } from '@/lib/api/hooks/use-clinics'
import { Award, Calendar, Check, DollarSign, Globe, MapPin, Star, Users } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function CompareClinicPage() {
  const { data: clinics = [], isLoading } = useClinicsQuery()
  const [selectedClinics, setSelectedClinics] = useState<string[]>([])
  
  // Initialize selected clinics when data loads
  if (selectedClinics.length === 0 && clinics.length >= 2) {
    setSelectedClinics([clinics[0].id, clinics[1].id])
  }

  const handleClinicChange = (index: number, clinicId: string) => {
    const newSelected = [...selectedClinics]
    newSelected[index] = clinicId
    setSelectedClinics(newSelected)
  }

  const compareData = selectedClinics.map((id) =>
    clinics.find((c) => c.id === id)
  )

  return (
    <div className="min-h-screen bg-[var(--cloud-white)]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[var(--kmed-blue)] to-[var(--kmed-navy)] text-white py-12">
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Compare Clinics Side-by-Side
          </h1>
          <p className="text-xl text-white/90">
            Select two clinics to compare their services, facilities, and expertise
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6 py-12">
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: 'var(--deep-grey)' }}>Loading clinics...</p>
          </div>
        ) : clinics.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg" style={{ color: 'var(--deep-grey)' }}>No clinics available for comparison.</p>
          </div>
        ) : (
        <>
        {/* Clinic Selectors */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[0, 1].map((index) => (
            <div key={index}>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--kmed-navy)' }}>
                Clinic {index + 1}
              </label>
              <select
                value={selectedClinics[index]}
                onChange={(e) => handleClinicChange(index, e.target.value)}
                className="w-full px-4 py-3 border rounded-lg text-base"
                style={{ borderColor: 'var(--border-grey)' }}
              >
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--soft-grey)]">
                  <th className="text-left p-4 font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                    Comparison
                  </th>
                  {compareData.map((clinic) => (
                    <th key={clinic?.id} className="p-4">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-3 rounded-lg overflow-hidden bg-white relative">
                          <Image
                            src={clinic?.imageUrl || "/placeholder.svg"}
                            alt={clinic?.name || "Clinic"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="font-semibold text-base" style={{ color: 'var(--kmed-navy)' }}>
                          {clinic?.name}
                        </div>
                        <div className="text-sm mt-1" style={{ color: 'var(--deep-grey)' }}>
                          {clinic?.location}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Rating */}
                <tr className="border-t" style={{ borderColor: 'var(--border-grey)' }}>
                  <td className="p-4 font-medium" style={{ color: 'var(--kmed-navy)' }}>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5" style={{ color: 'var(--kmed-teal)' }} />
                      Rating & Reviews
                    </div>
                  </td>
                  {compareData.map((clinic) => (
                    <td key={clinic?.id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="h-4 w-4 fill-[var(--warning-yellow)] text-[var(--warning-yellow)]" />
                        <span className="font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                          {clinic?.rating}
                        </span>
                      </div>
                      <div className="text-sm" style={{ color: 'var(--deep-grey)' }}>
                        {clinic?.reviewCount} reviews
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Location */}
                <tr className="border-t bg-[var(--soft-grey)]/30" style={{ borderColor: 'var(--border-grey)' }}>
                  <td className="p-4 font-medium" style={{ color: 'var(--kmed-navy)' }}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" style={{ color: 'var(--kmed-teal)' }} />
                      Location
                    </div>
                  </td>
                  {compareData.map((clinic) => (
                    <td key={clinic?.id} className="p-4 text-center text-sm" style={{ color: 'var(--deep-grey)' }}>
                      {clinic?.address}
                    </td>
                  ))}
                </tr>

                {/* Specialties */}
                <tr className="border-t" style={{ borderColor: 'var(--border-grey)' }}>
                  <td className="p-4 font-medium" style={{ color: 'var(--kmed-navy)' }}>
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5" style={{ color: 'var(--kmed-teal)' }} />
                      Specialties
                    </div>
                  </td>
                  {compareData.map((clinic) => (
                    <td key={clinic?.id} className="p-4">
                      <div className="flex flex-wrap gap-1 justify-center">
                        {clinic?.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="px-2 py-1 rounded text-xs bg-[var(--soft-grey)]"
                            style={{ color: 'var(--kmed-blue)' }}
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Languages */}
                <tr className="border-t bg-[var(--soft-grey)]/30" style={{ borderColor: 'var(--border-grey)' }}>
                  <td className="p-4 font-medium" style={{ color: 'var(--kmed-navy)' }}>
                    <div className="flex items-center gap-2">
                      <Globe className="h-5 w-5" style={{ color: 'var(--kmed-teal)' }} />
                      Languages
                    </div>
                  </td>
                  {compareData.map((clinic) => (
                    <td key={clinic?.id} className="p-4 text-center text-sm" style={{ color: 'var(--deep-grey)' }}>
                      {clinic?.languagesSupported.join(', ')}
                    </td>
                  ))}
                </tr>

                {/* Established */}
                <tr className="border-t" style={{ borderColor: 'var(--border-grey)' }}>
                  <td className="p-4 font-medium" style={{ color: 'var(--kmed-navy)' }}>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" style={{ color: 'var(--kmed-teal)' }} />
                      Year Established
                    </div>
                  </td>
                  {compareData.map((clinic) => (
                    <td key={clinic?.id} className="p-4 text-center font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                      {clinic?.yearEstablished}
                    </td>
                  ))}
                </tr>

                {/* International Patients */}
                <tr className="border-t bg-[var(--soft-grey)]/30" style={{ borderColor: 'var(--border-grey)' }}>
                  <td className="p-4 font-medium" style={{ color: 'var(--kmed-navy)' }}>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5" style={{ color: 'var(--kmed-teal)' }} />
                      International Patients
                    </div>
                  </td>
                  {compareData.map((clinic) => (
                    <td key={clinic?.id} className="p-4 text-center font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                      {clinic?.internationalPatients}
                    </td>
                  ))}
                </tr>

                {/* Price Range */}
                <tr className="border-t" style={{ borderColor: 'var(--border-grey)' }}>
                  <td className="p-4 font-medium" style={{ color: 'var(--kmed-navy)' }}>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" style={{ color: 'var(--kmed-teal)' }} />
                      Price Range
                    </div>
                  </td>
                  {compareData.map((clinic) => (
                    <td key={clinic?.id} className="p-4 text-center font-semibold" style={{ color: 'var(--kmed-navy)' }}>
                      {clinic?.priceRange}
                    </td>
                  ))}
                </tr>

                {/* Success Rate */}
                {compareData.some((c) => c?.successRate) && (
                  <tr className="border-t bg-[var(--soft-grey)]/30" style={{ borderColor: 'var(--border-grey)' }}>
                    <td className="p-4 font-medium" style={{ color: 'var(--kmed-navy)' }}>
                      Success Rate
                    </td>
                    {compareData.map((clinic) => (
                      <td key={clinic?.id} className="p-4 text-center font-semibold" style={{ color: 'var(--success-green)' }}>
                        {clinic?.successRate || 'N/A'}
                      </td>
                    ))}
                  </tr>
                )}

                {/* Accreditations */}
                <tr className="border-t" style={{ borderColor: 'var(--border-grey)' }}>
                  <td className="p-4 font-medium" style={{ color: 'var(--kmed-navy)' }}>
                    Accreditations
                  </td>
                  {compareData.map((clinic) => (
                    <td key={clinic?.id} className="p-4">
                      <div className="space-y-1">
                        {clinic?.accreditations.map((acc) => (
                          <div key={acc} className="flex items-center justify-center gap-2 text-sm">
                            <Check className="h-4 w-4" style={{ color: 'var(--success-green)' }} />
                            <span style={{ color: 'var(--deep-grey)' }}>{acc}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Actions */}
                <tr className="border-t bg-[var(--soft-grey)]" style={{ borderColor: 'var(--border-grey)' }}>
                  <td className="p-4 font-medium" style={{ color: 'var(--kmed-navy)' }}>
                    Actions
                  </td>
                  {compareData.map((clinic) => (
                    <td key={clinic?.id} className="p-4">
                      <div className="flex flex-col gap-2">
                        <Link href={`/clinics/${clinic?.slug}`}>
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
                            className="w-full bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
                          >
                            Request Consultation
                          </Button>
                        </Link>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link href="/clinics">
            <Button
              variant="outline"
              size="lg"
              style={{ borderColor: 'var(--kmed-blue)', color: 'var(--kmed-blue)' }}
            >
              ← Back to All Clinics
            </Button>
          </Link>
        </div>
        </>
        )}
      </div>
    </div>
  )
}
