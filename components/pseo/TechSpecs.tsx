'use client'

import { CheckCircle2, Info } from 'lucide-react'

interface TechSpecsProps {
    city: string
    treatmentTitle: string
    priceRange: string
}

export function PseoTechSpecs({ city, treatmentTitle, priceRange }: TechSpecsProps) {
    return (
        <div className="grid gap-8 lg:grid-cols-3">
            {/* Col 1: Tech Specs */}
            <div className="lg:col-span-2 space-y-6">
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold text-[var(--kmed-navy)] flex items-center gap-2">
                        <Info className="h-5 w-5 text-[var(--kmed-blue)]" />
                        Technical Specifications
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg bg-[var(--soft-grey)] p-4">
                            <p className="text-xs text-gray-500 uppercase">Procedure</p>
                            <p className="font-semibold text-[var(--kmed-navy)]">{treatmentTitle}</p>
                        </div>
                        <div className="rounded-lg bg-[var(--soft-grey)] p-4">
                            <p className="text-xs text-gray-500 uppercase">Est. Duration</p>
                            <p className="font-semibold text-[var(--kmed-navy)]">2-5 Hours (varies)</p>
                        </div>
                        <div className="rounded-lg bg-[var(--soft-grey)] p-4">
                            <p className="text-xs text-gray-500 uppercase">Anesthesia</p>
                            <p className="font-semibold text-[var(--kmed-navy)]">Local / General</p>
                        </div>
                        <div className="rounded-lg bg-[var(--soft-grey)] p-4">
                            <p className="text-xs text-gray-500 uppercase">Recovery</p>
                            <p className="font-semibold text-[var(--kmed-navy)]">3-7 Days in Korea</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-[var(--kmed-navy)] mb-2">Why {city}?</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {city} is a premier destination for {treatmentTitle}, offering ultra-modern facilities compliant with international safety standards. Clinics in this region utilize advanced imaging and minimally invasive techniques to ensure optimal outcomes with reduced downtime.
                        </p>
                    </div>
                </div>
            </div>

            {/* Col 2: Benefits / Trust */}
            <div className="space-y-6">
                <div className="rounded-xl bg-[var(--kmed-navy)] p-6 text-white shadow-lg">
                    <h3 className="mb-4 font-bold text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-[var(--kmed-teal)]" />
                        The K-Med Guarantee
                    </h3>
                    <ul className="space-y-3 text-sm text-white/80">
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--kmed-teal)]" />
                            Direct access to KAHF verified surgeons
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--kmed-teal)]" />
                            Zero markups on procedure costs
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--kmed-teal)]" />
                            Full medical visa verification support
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--kmed-teal)]" />
                            Post-op care coordination included
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
