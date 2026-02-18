import dynamic from 'next/dynamic'
import { HeroSection } from '@/components/home/hero-section'
import { SystemBootLoader } from '@/components/ui/system-boot-loader'

const InfiniteMarquee = dynamic(
  () => import('@/components/ui/infinite-marquee').then(m => m.InfiniteMarquee),
  { ssr: true, loading: () => <div className="h-16 bg-muted/30 animate-pulse" /> }
)
const HowItWorksSection = dynamic(
  () => import('@/components/home/how-it-works-section').then(m => m.HowItWorksSection),
  { ssr: true, loading: () => <div className="min-h-[320px] bg-muted/20" /> }
)
const FeaturedTreatmentsSection = dynamic(
  () => import('@/components/home/featured-treatments-section').then(m => m.FeaturedTreatmentsSection),
  { ssr: true, loading: () => <div className="min-h-[400px] bg-muted/20" /> }
)
const WhyKmedtourSection = dynamic(
  () => import('@/components/home/why-kmedtour-section').then(m => m.WhyKmedtourSection),
  { ssr: true, loading: () => <div className="min-h-[320px] bg-muted/20" /> }
)
const CTASection = dynamic(
  () => import('@/components/home/cta-section').then(m => m.CTASection),
  { ssr: true, loading: () => <div className="min-h-[280px] bg-muted/20" /> }
)

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <SystemBootLoader />
      <HeroSection />
      <InfiniteMarquee />
      <HowItWorksSection />
      <FeaturedTreatmentsSection />
      <WhyKmedtourSection />
      <CTASection />
    </main>
  )
}
