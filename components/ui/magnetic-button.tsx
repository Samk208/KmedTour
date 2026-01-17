'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { useRef, useState } from 'react'

interface MagneticButtonProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    strength?: number // How strong the magnetic pull is (default 0.5)
}

export function MagneticButton({ children, className, strength = 0.5, ...props }: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { clientX, clientY } = e
        const { height, width, left, top } = ref.current?.getBoundingClientRect() || { height: 0, width: 0, left: 0, top: 0 }

        const centerX = left + width / 2
        const centerY = top + height / 2

        const x = (clientX - centerX) * strength
        const y = (clientY - centerY) * strength

        setPosition({ x, y })
    }

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 })
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
            className={cn('inline-block', className)}
            {...(props as any)}
        >
            {children}
        </motion.div>
    )
}
