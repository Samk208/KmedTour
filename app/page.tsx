import { CTASection } from '@/components/home/cta-section'
import { FeaturedTreatmentsSection } from '@/components/home/featured-treatments-section'
import { HeroSection } from '@/components/home/hero-section'
import { HowItWorksSection } from '@/components/home/how-it-works-section'
import { WhyKmedtourSection } from '@/components/home/why-kmedtour-section'
import { InfiniteMarquee } from '@/components/ui/infinite-marquee'
import { SystemBootLoader } from '@/components/ui/system-boot-loader'

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
