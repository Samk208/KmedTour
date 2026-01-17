import { getTestimonials } from '@/lib/api/repositories/testimonials-repository'
import { Testimonial } from '@/lib/schemas/testimonial'
import { useQuery } from '@tanstack/react-query'

export function useTestimonialsQuery() {
  return useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: () => getTestimonials(),
  })
}
