import { HeroSection } from '@/components/hero-section'
import { CoreFlowSection } from '@/components/core-flow-section'
import { FeaturedRequestsSection } from '@/components/featured-requests-section'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <HeroSection />
      <CoreFlowSection />
      <FeaturedRequestsSection />
    </div>
  )
}
