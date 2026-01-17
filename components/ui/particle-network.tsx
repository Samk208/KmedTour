'use client'

import { useMotionValue } from 'framer-motion'
import { useEffect, useRef } from 'react'

export function ParticleNetwork() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Mouse position state
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let particles: Particle[] = []

        // Configuration
        const particleCount = 40 // Low count for minimal aesthetic
        const connectionDistance = 150
        const mouseSafetyRadius = 200

        class Particle {
            x: number
            y: number
            vx: number
            vy: number
            size: number

            constructor(w: number, h: number) {
                this.x = Math.random() * w
                this.y = Math.random() * h
                this.vx = (Math.random() - 0.5) * 0.3 // Slow movement
                this.vy = (Math.random() - 0.5) * 0.3
                this.size = Math.random() * 2 + 1
            }

            update(w: number, h: number) {
                this.x += this.vx
                this.y += this.vy

                // Bounce off edges
                if (this.x < 0 || this.x > w) this.vx *= -1
                if (this.y < 0 || this.y > h) this.vy *= -1
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.fillStyle = 'rgba(57, 198, 176, 0.4)' // Teal
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        const init = () => {
            const { innerWidth, innerHeight } = window
            canvas.width = innerWidth
            canvas.height = innerHeight
            particles = []
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(innerWidth, innerHeight))
            }
        }

        const animate = () => {
            const { innerWidth, innerHeight } = window
            ctx.clearRect(0, 0, innerWidth, innerHeight)

            particles.forEach((particle, i) => {
                particle.update(innerWidth, innerHeight)
                particle.draw(ctx)

                // Connect particles
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[j].x - particle.x
                    const dy = particles[j].y - particle.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < connectionDistance) {
                        ctx.beginPath()
                        ctx.strokeStyle = `rgba(57, 198, 176, ${0.15 - distance / connectionDistance * 0.15})`
                        ctx.lineWidth = 1
                        ctx.moveTo(particle.x, particle.y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.stroke()
                    }
                }

                // Connect to mouse
                const dx = mouseX.get() - particle.x
                const dy = mouseY.get() - particle.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < mouseSafetyRadius) {
                    ctx.beginPath()
                    ctx.strokeStyle = `rgba(37, 99, 235, ${0.2 - distance / mouseSafetyRadius * 0.2})` // Blue for mouse interaction
                    ctx.lineWidth = 1
                    ctx.moveTo(particle.x, particle.y)
                    ctx.lineTo(mouseX.get(), mouseY.get())
                    ctx.stroke()
                }
            })

            animationFrameId = requestAnimationFrame(animate)
        }

        const handleResize = () => {
            init()
        }

        const handleMouseMove = (e: MouseEvent) => {
            const rect = containerRef.current?.getBoundingClientRect()
            if (rect) {
                mouseX.set(e.clientX - rect.left)
                mouseY.set(e.clientY - rect.top)
            }
        }

        window.addEventListener('resize', handleResize)
        window.addEventListener('mousemove', handleMouseMove)

        init()
        animate()

        return () => {
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('mousemove', handleMouseMove)
            cancelAnimationFrame(animationFrameId)
        }
    }, [mouseX, mouseY])

    return (
        <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <canvas ref={canvasRef} className="opacity-60" />
        </div>
    )
}
