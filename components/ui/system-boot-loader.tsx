'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Activity, Database, Globe, Server, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'

export function SystemBootLoader() {
    const [loading, setLoading] = useState(true)
    const [steps, setSteps] = useState<string[]>([])

    useEffect(() => {
        // Check if we've already booted
        const hasBooted = sessionStorage.getItem('kmed_system_booted')
        if (hasBooted) {
            setLoading(false)
            return
        }

        // Sequence of "boot" messages
        const bootSequence = [
            { text: 'INITIALIZING K-OS KERNEL...', delay: 200 },
            { text: 'LOADING BIOMETRIC PROTOCOLS...', delay: 800 },
            { text: 'ESTABLISHING SECURE HANDSHAKE...', delay: 1500 },
            { text: 'CONNECTING TO INFRASTRUCTURE...', delay: 2200 },
            { text: 'SYSTEM READY.', delay: 2800 },
        ]

        const timeouts: NodeJS.Timeout[] = []

        bootSequence.forEach(({ text, delay }) => {
            const timeout = setTimeout(() => {
                setSteps(prev => [...prev, text])
            }, delay)
            timeouts.push(timeout)
        })

        const finishTimeout = setTimeout(() => {
            setLoading(false)
            sessionStorage.setItem('kmed_system_booted', 'true')
        }, 3500)
        timeouts.push(finishTimeout)

        return () => timeouts.forEach(clearTimeout)
    }, [])

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    transition={{ duration: 0.8 }}
                    className="fixed inset-0 z-50 bg-[#0a0f1c] text-[var(--kmed-teal)] font-mono flex flex-col items-center justify-center p-4"
                >
                    <div className="w-full max-w-md space-y-6">

                        {/* Logo / Icon Glitch Effect */}
                        <div className="flex justify-center mb-8">
                            <motion.div
                                animate={{
                                    scale: [1, 1.05, 1],
                                    opacity: [0.8, 1, 0.8],
                                    textShadow: ["0 0 0px #39c6b0", "0 0 10px #39c6b0", "0 0 0px #39c6b0"]
                                }}
                                transition={{ duration: 0.2, repeat: Infinity, repeatType: "reverse" }}
                            >
                                <Activity className="w-16 h-16" />
                            </motion.div>
                        </div>

                        {/* Loading Bar */}
                        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 3, ease: "easeInOut" }}
                                className="h-full bg-[var(--kmed-teal)] shadow-[0_0_10px_var(--kmed-teal)]"
                            />
                        </div>

                        {/* Console Output */}
                        <div className="h-40 flex flex-col justify-end gap-1 text-xs md:text-sm opacity-80">
                            {steps.map((step, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>
                                    <span>{">"} {step}</span>
                                </motion.div>
                            ))}
                            <motion.div
                                animate={{ opacity: [0, 1] }}
                                transition={{ repeat: Infinity, duration: 0.5 }}
                                className="w-2 h-4 bg-[var(--kmed-teal)]"
                            />
                        </div>

                        {/* Stat Grid Mockup */}
                        <div className="grid grid-cols-4 gap-2 text-[10px] text-gray-600 pt-4 border-t border-gray-800/50">
                            <div className="text-center">
                                <Database className="w-4 h-4 mx-auto mb-1 opacity-50" />
                                <div>DB: ONLINE</div>
                            </div>
                            <div className="text-center">
                                <Globe className="w-4 h-4 mx-auto mb-1 opacity-50" />
                                <div>NET: SECURE</div>
                            </div>
                            <div className="text-center">
                                <Server className="w-4 h-4 mx-auto mb-1 opacity-50" />
                                <div>CPU: NOMINAL</div>
                            </div>
                            <div className="text-center">
                                <ShieldCheck className="w-4 h-4 mx-auto mb-1 opacity-50" />
                                <div>AUTH: OK</div>
                            </div>
                        </div>

                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
