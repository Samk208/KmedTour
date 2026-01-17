'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Globe, Star } from 'lucide-react'
import Link from 'next/link'

import { Clinic } from '@/lib/schemas/clinic'

interface ClinicListProps {
    clinics: Clinic[]
    city: string
}

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
}

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
}

export function PseoClinicList({ clinics, city }: ClinicListProps) {
    if (clinics.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <p className="text-gray-500">
                    No specific clinic matches found in {city} for this filter, but our concierge network covers this region.
                </p>
            </div>
        )
    }

    return (
        <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
            {clinics.map((clinic) => (
                <motion.div
                    key={clinic.id}
                    variants={item}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-[var(--kmed-blue)] hover:shadow-md"
                >
                    {/* Glassmorphic Top Highlight */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--kmed-teal)] to-[var(--kmed-blue)] opacity-0 transition-opacity group-hover:opacity-100" />

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
                            <div className="flex items-center gap-1 rounded-full bg-[var(--soft-grey)] px-2 py-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs font-bold text-[var(--kmed-navy)]">9.8</span>
                            </div>
                        </div>

                        <div className="mb-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Globe className="h-4 w-4 text-[var(--kmed-teal)]" />
                                <span>English, Korean, Chinese</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {clinic.specialties.slice(0, 3).map((spec, idx) => (
                                    <span
                                        key={idx}
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
                        >
                            View Clinic Profile
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    )
}
