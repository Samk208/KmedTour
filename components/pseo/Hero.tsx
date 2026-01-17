'use client'

import { motion } from 'framer-motion'
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
    successRate = '95%+',
}: HeroProps) {
    return (
        <div className="relative overflow-hidden bg-[var(--kmed-navy)] text-white">
            {/* Background Tech Grid */}
            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage:
                        'linear-gradient(var(--kmed-teal) 1px, transparent 1px), linear-gradient(90deg, var(--kmed-teal) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--kmed-navy)]" />

            <div className="container relative z-10 mx-auto max-w-5xl px-4 py-20 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[var(--kmed-teal)]"
                >
                    <span className="flex h-2 w-2 items-center justify-center rounded-full bg-[var(--kmed-teal)] animate-pulse" />
                    System Loaded
                    <span className="text-white/30">|</span>
                    {city} &gt; {treatmentTitle}
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="mb-6 text-4xl font-bold leading-tight md:text-6xl"
                >
                    World-Class{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--kmed-teal)] to-blue-400">
                        {treatmentTitle}
                    </span>{' '}
                    in {city}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-8 max-w-2xl text-lg text-white/80"
                >
                    Access the top {clinicCount} verified clinics in {city}. Concierge-coordinated care,
                    transparent pricing, and KAHF/KOIHA accredited safety protocols.
                </motion.p>

                {/* Data Badges */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="mb-10 flex flex-wrap gap-4"
                >
                    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                        <ShieldCheck className="h-5 w-5 text-[var(--kmed-teal)]" />
                        <div>
                            <p className="text-xs text-white/50 uppercase">Verified Clinics</p>
                            <p className="font-mono text-sm font-bold">{clinicCount} Active</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                        <Activity className="h-5 w-5 text-blue-400" />
                        <div>
                            <p className="text-xs text-white/50 uppercase">Est. Price</p>
                            <p className="font-mono text-sm font-bold">{priceRange}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                        <MapPin className="h-5 w-5 text-purple-400" />
                        <div>
                            <p className="text-xs text-white/50 uppercase">Region</p>
                            <p className="font-mono text-sm font-bold">{city}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex flex-wrap gap-4"
                >
                    <Button
                        size="lg"
                        className="bg-[var(--kmed-blue)] hover:bg-blue-600 text-white border-0 shadow-lg shadow-blue-900/20"
                        asChild
                    >
                        <Link href="/patient-intake">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Initialize Consultation
                        </Link>
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                        asChild
                    >
                        <Link href="/treatment-advisor">Run Advisor Analysis</Link>
                    </Button>
                </motion.div>
            </div>
        </div>
    )
}
