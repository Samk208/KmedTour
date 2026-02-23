import { ArrowRight, Globe, Star } from 'lucide-react'
import Link from 'next/link'

import { Clinic } from '@/lib/schemas/clinic'

interface ClinicListProps {
    clinics: Clinic[]
    city: string
}

export function PseoClinicList({ clinics, city }: ClinicListProps) {
    if (clinics.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <p className="text-gray-500">
                    No specific clinic matches found in {city} for this procedure, but our concierge network can connect you with verified options in this region.
                </p>
                <Link
                    href="/patient-intake"
                    className="mt-4 inline-block rounded-lg bg-[var(--kmed-blue)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
                >
                    Request a Personalized Match
                </Link>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {clinics.map((clinic) => {
                const rating = clinic.rating ? Number(clinic.rating).toFixed(1) : null

                return (
                    <div
                        key={clinic.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[var(--kmed-blue)] hover:shadow-md"
                    >
                        <div
                            className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--kmed-teal)] to-[var(--kmed-blue)] opacity-0 transition-opacity group-hover:opacity-100"
                            aria-hidden="true"
                        />

                        <div>
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-[var(--kmed-navy)] group-hover:text-[var(--kmed-blue)]">
                                        {clinic.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        {clinic.location || city}
                                    </p>
                                </div>
                                {rating && (
                                    <div
                                        className="flex items-center gap-1 rounded-full bg-[var(--soft-grey)] px-2 py-1"
                                        aria-label={`Rating: ${rating} out of 10`}
                                    >
                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" aria-hidden="true" />
                                        <span className="text-xs font-bold text-[var(--kmed-navy)]">{rating}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4 space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Globe className="h-4 w-4 text-[var(--kmed-teal)]" aria-hidden="true" />
                                    <span>English, Korean &amp; more</span>
                                </div>
                                <div className="flex flex-wrap gap-2" role="list" aria-label="Specialties">
                                    {clinic.specialties.slice(0, 3).map((spec) => (
                                        <span
                                            key={spec}
                                            role="listitem"
                                            className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
                                        >
                                            {spec}
                                        </span>
                                    ))}
                                    {clinic.specialties.length > 3 && (
                                        <span className="text-xs text-gray-400 self-center">
                                            +{clinic.specialties.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 border-t border-gray-100 pt-4">
                            <Link
                                href={`/hospitals/${clinic.slug}`}
                                className="flex items-center justify-between text-sm font-semibold text-[var(--kmed-blue)] hover:underline"
                                aria-label={`View profile for ${clinic.name}`}
                            >
                                View Clinic Profile
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
