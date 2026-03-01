'use client'

import { useMotionValue } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface ParticleNetworkProps {
    particleCount?: number
    connectionDistance?: number
    mouseRadius?: number
    speed?: number
    tealOpacity?: number
    blueOpacity?: number
}

export function ParticleNetwork({
    particleCount = 70,
    connectionDistance = 180,
    mouseRadius = 250,
    speed = 0.5,
    tealOpacity = 0.6,
    blueOpacity = 0.35,
}: ParticleNetworkProps = {}) {
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

        class Particle {
            x: number
            y: number
            vx: number
            vy: number
            size: number
            baseSize: number
            pulsePhase: number

            constructor(w: number, h: number) {
                this.x = Math.random() * w
                this.y = Math.random() * h
                this.vx = (Math.random() - 0.5) * speed
                this.vy = (Math.random() - 0.5) * speed
                this.baseSize = Math.random() * 2.5 + 1
                this.size = this.baseSize
                this.pulsePhase = Math.random() * Math.PI * 2
            }

            update(w: number, h: number, time: number) {
                this.x += this.vx
                this.y += this.vy

                // Gentle pulse effect
                this.size = this.baseSize + Math.sin(time * 0.002 + this.pulsePhase) * 0.5

                // Bounce off edges with soft damping
                if (this.x < 0 || this.x > w) this.vx *= -1
                if (this.y < 0 || this.y > h) this.vy *= -1
            }

            draw(ctx: CanvasRenderingContext2D) {
                // Glow effect
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3)
                gradient.addColorStop(0, `rgba(57, 198, 176, ${tealOpacity})`)
                gradient.addColorStop(0.5, `rgba(57, 198, 176, ${tealOpacity * 0.3})`)
                gradient.addColorStop(1, 'rgba(57, 198, 176, 0)')

                ctx.fillStyle = gradient
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2)
                ctx.fill()

                // Core particle
                ctx.fillStyle = `rgba(57, 198, 176, ${tealOpacity + 0.2})`
                ctx.beginPath()
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx.fill()
            }
        }

        const init = () => {
            const rect = containerRef.current?.getBoundingClientRect()
            if (!rect) return
            canvas.width = rect.width
            canvas.height = rect.height
            particles = []
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(canvas.width, canvas.height))
            }
        }

        let time = 0
        const animate = () => {
            time++
            const w = canvas.width
            const h = canvas.height
            ctx.clearRect(0, 0, w, h)

            particles.forEach((particle, i) => {
                particle.update(w, h, time)
                particle.draw(ctx)

                // Connect particles
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[j].x - particle.x
                    const dy = particles[j].y - particle.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < connectionDistance) {
                        const opacity = (1 - distance / connectionDistance) * blueOpacity
                        ctx.beginPath()
                        ctx.strokeStyle = `rgba(57, 198, 176, ${opacity})`
                        ctx.lineWidth = 0.8
                        ctx.moveTo(particle.x, particle.y)
                        ctx.lineTo(particles[j].x, particles[j].y)
                        ctx.stroke()
                    }
                }

                // Connect to mouse with stronger blue glow
                const mx = mouseX.get()
                const my = mouseY.get()
                if (mx > 0 && my > 0) {
                    const dx = mx - particle.x
                    const dy = my - particle.y
                    const distance = Math.sqrt(dx * dx + dy * dy)

                    if (distance < mouseRadius) {
                        const opacity = (1 - distance / mouseRadius) * 0.4
                        ctx.beginPath()
                        ctx.strokeStyle = `rgba(37, 99, 235, ${opacity})`
                        ctx.lineWidth = 1.5
                        ctx.moveTo(particle.x, particle.y)
                        ctx.lineTo(mx, my)
                        ctx.stroke()

                        // Draw a glow at mouse position
                        const mouseGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 30)
                        mouseGlow.addColorStop(0, `rgba(37, 99, 235, ${opacity * 0.3})`)
                        mouseGlow.addColorStop(1, 'rgba(37, 99, 235, 0)')
                        ctx.fillStyle = mouseGlow
                        ctx.beginPath()
                        ctx.arc(mx, my, 30, 0, Math.PI * 2)
                        ctx.fill()
                    }
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mouseX, mouseY, particleCount, connectionDistance, mouseRadius, speed, tealOpacity, blueOpacity])

    return (
        <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <canvas ref={canvasRef} className="w-full h-full opacity-80" />
        </div>
    )
}
