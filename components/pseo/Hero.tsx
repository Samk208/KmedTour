import { Activity, MapPin, ShieldCheck, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

interface HeroProps {
    city: string
    treatmentTitle: string
    clinicCount: number
    priceRange: string
    successRate?: string
}

export function PseoHero({
    city,
    treatmentTitle,
    clinicCount,
    priceRange,
    successRate,
}: HeroProps) {
    return (
        <div className="relative overflow-hidden bg-[var(--kmed-navy)] text-white">
            {/* Decorative background pattern */}
            <div
                className="absolute inset-0 opacity-[0.06]"
                aria-hidden="true"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--kmed-navy)]" aria-hidden="true" />

            <div className="container relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6">
                {/* Trust badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[var(--kmed-teal)] backdrop-blur-sm">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    KAHF &amp; KOIHA Verified Clinics
                </div>

                <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
                    Trusted{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--kmed-teal)] to-blue-400">
                        {treatmentTitle}
                    </span>{' '}
                    Care in {city}
                </h1>

                <p className="mb-8 max-w-2xl text-lg text-white/90 leading-relaxed">
                    Connect with {clinicCount > 0 ? clinicCount : 'verified'} accredited clinics in {city}, South Korea.
                    Expert concierge support, transparent pricing, and dedicated coordination from inquiry to recovery.
                </p>

                {/* Data badges */}
                <div className="mb-10 flex flex-wrap gap-4" role="list" aria-label="Key facts">
                    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm" role="listitem">
                        <ShieldCheck className="h-5 w-5 text-[var(--kmed-teal)]" aria-hidden="true" />
                        <div>
                            <p className="text-xs text-white/60 uppercase tracking-wide">Verified Clinics</p>
                            <p className="font-semibold text-sm">{clinicCount > 0 ? `${clinicCount} Active` : 'Network Access'}</p>
                        </div>
                    </div>
                    {priceRange && priceRange !== 'Contact for quote' && (
                        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm" role="listitem">
                            <Activity className="h-5 w-5 text-blue-400" aria-hidden="true" />
                            <div>
                                <p className="text-xs text-white/60 uppercase tracking-wide">Est. Price</p>
                                <p className="font-semibold text-sm">{priceRange}</p>
                            </div>
                        </div>
                    )}
                    {successRate && (
                        <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm" role="listitem">
                            <Activity className="h-5 w-5 text-green-400" aria-hidden="true" />
                            <div>
                                <p className="text-xs text-white/60 uppercase tracking-wide">Success Rate</p>
                                <p className="font-semibold text-sm">{successRate}</p>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm" role="listitem">
                        <MapPin className="h-5 w-5 text-purple-400" aria-hidden="true" />
                        <div>
                            <p className="text-xs text-white/60 uppercase tracking-wide">Location</p>
                            <p className="font-semibold text-sm">{city}, South Korea</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <Button
                        size="lg"
                        className="bg-[var(--kmed-blue)] hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-900/20"
                        asChild
                    >
                        <Link href="/patient-intake">
                            <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                            Start Your Free Consultation
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                        asChild
                    >
                        <Link href="/treatment-advisor">Get Treatment Recommendations</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
