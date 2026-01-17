'use client'

import { useTestimonialsQuery } from '@/lib/api/hooks/use-testimonials'
import { Quote, Star } from 'lucide-react'

export function TestimonialsSection() {
  const { data: testimonials = [], isLoading } = useTestimonialsQuery()
  return (
    <section className="w-full py-20 md:py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <div 
            className="inline-block px-4 py-2 rounded-full text-sm font-medium"
            style={{ backgroundColor: 'var(--soft-grey)', color: 'var(--kmed-blue)' }}
          >
            Patient Stories
          </div>
          <h2 
            className="text-3xl md:text-4xl font-bold text-balance"
            style={{ color: 'var(--kmed-navy)' }}
          >
            Real Stories from Real Patients
          </h2>
          <p 
            className="text-lg max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'var(--deep-grey)' }}
          >
            Hear from African patients who have successfully received world-class 
            medical treatment in Korea through Kmedtour.
          </p>
        </div>

        {/* Testimonials Grid */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>Loading testimonials...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>No testimonials available.</p>
          </div>
        ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              {/* Quote Icon */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--kmed-blue)' }}
              >
                <Quote className="h-5 w-5 text-white" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-current"
                    style={{ color: 'var(--kmed-teal)' }}
                  />
                ))}
              </div>

              {/* Quote */}
              <p 
                className="text-sm leading-relaxed mb-6 flex-1"
                style={{ color: 'var(--deep-grey)' }}
              >
                &ldquo;{testimonial.quote}&rdquo;
              </p>

              {/* Patient Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                {/* Avatar with Flag */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-semibold"
                  style={{ backgroundColor: 'var(--soft-grey)' }}
                >
                  {getFlagEmoji(testimonial.countryCode)}
                </div>
                
                <div className="flex-1">
                  <div 
                    className="font-semibold text-sm"
                    style={{ color: 'var(--kmed-navy)' }}
                  >
                    {testimonial.name}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--deep-grey)' }}>
                    {testimonial.country} • {testimonial.treatment}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p 
            className="text-sm mb-4"
            style={{ color: 'var(--deep-grey)' }}
          >
            Join hundreds of satisfied patients from across Africa
          </p>
          <a
            href="/patient-intake"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: 'var(--kmed-blue)' }}
          >
            Start Your Journey
          </a>
        </div>
      </div>
    </section>
  )
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
