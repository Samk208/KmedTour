'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface ProtocolStepProps {
    number: string
    title: string
    description: string
    icon: LucideIcon
    isLast?: boolean
    align?: 'left' | 'right'
}

export function ProtocolStep({ number, title, description, icon: Icon, isLast = false, align = 'left' }: ProtocolStepProps) {
    return (
        <div className={cn("relative flex gap-8 md:gap-16 items-start font-mono group", align === 'right' ? 'md:flex-row-reverse md:text-right' : 'md:flex-row')}>

            {/* Timeline Line (Center) */}
            <div className="absolute left-8 md:left-1/2 top-16 bottom-0 w-px bg-gray-200 -translate-x-1/2 md:translate-x-0 h-full">
                {!isLast && (
                    <motion.div
                        initial={{ height: "0%" }}
                        whileInView={{ height: "100%" }}
                        viewport={{ margin: "-20% 0px -20% 0px" }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="w-full bg-[var(--kmed-teal)] origin-top shadow-[0_0_10px_var(--kmed-teal)]"
                    />
                )}
            </div>

            {/* Icon Node (Center) */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ margin: "-100px" }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="relative z-10 flex-shrink-0 w-16 h-16 md:absolute md:left-1/2 md:-translate-x-1/2 rounded-full border-4 border-white bg-[var(--kmed-navy)] flex items-center justify-center shadow-xl"
            >
                <Icon className="w-6 h-6 text-[var(--kmed-teal)]" />
                <div className="absolute inset-0 rounded-full border border-[var(--kmed-teal)] opacity-50 animate-ping" />
            </motion.div>


            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, x: align === 'left' ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={cn("flex-1 pt-2 md:pt-0 md:w-1/2", align === 'right' ? 'md:pr-16 md:text-right' : 'md:pl-16')}
            >
                <div className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-[var(--kmed-teal)] uppercase mb-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--kmed-teal)]" />
                    Phase {number}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-[var(--kmed-navy)] mb-4">{title}</h3>
                <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group-hover:border-[var(--kmed-teal)]/30">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--kmed-teal)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-gray-600 leading-relaxed font-sans">{description}</p>
                </div>
            </motion.div>

            {/* Spacer for alternating layout */}
            <div className="hidden md:block md:w-1/2" />
        </div>
    )
}
