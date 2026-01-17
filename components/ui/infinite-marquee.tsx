'use client'

import { motion } from 'framer-motion'
import { Award, CheckCircle, Shield } from 'lucide-react'

export function InfiniteMarquee() {
    const items = [
        { text: 'JCI Accredited', icon: Award },
        { text: 'K-Health Certified', icon: CheckCircle },
        { text: 'HIPAA Compliant', icon: Shield },
        { text: 'Ministry of Health & Welfare', icon: Award },
        { text: 'Global Insurance Partners', icon: CheckCircle },
        { text: 'ISO 27001 Security', icon: Shield },
        // Duplicate for seamless loop
        { text: 'JCI Accredited', icon: Award },
        { text: 'K-Health Certified', icon: CheckCircle },
        { text: 'HIPAA Compliant', icon: Shield },
        { text: 'Ministry of Health & Welfare', icon: Award },
        { text: 'Global Insurance Partners', icon: CheckCircle },
        { text: 'ISO 27001 Security', icon: Shield },
    ]

    return (
        <div className="w-full bg-[var(--kmed-navy)] border-y border-white/5 overflow-hidden py-4">
            <div className="relative w-full max-w-[100vw]">
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[var(--kmed-navy)] to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[var(--kmed-navy)] to-transparent z-10" />

                <motion.div
                    className="flex gap-16 w-max items-center"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-gray-400 font-medium whitespace-nowrap">
                            <item.icon className="w-5 h-5 text-[var(--kmed-teal)] opacity-70" />
                            <span className="scrolling-text text-sm uppercase tracking-wider">{item.text}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
