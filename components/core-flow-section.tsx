import Link from 'next/link'

export function CoreFlowSection() {
  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
              Core flow
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937]">
              From struggling alone to solving together
            </h2>
          </div>
          <Link
            href="/ai-center"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#E5E5E0] text-[#1F2937] font-medium hover:bg-white transition-colors text-sm"
          >
            Try onboarding AI
          </Link>
        </div>

        {/* Flow Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-[#1F2937] mb-3">
              Ask for help clearly
            </h3>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              Create structured requests with category, urgency, AI suggestions, and tags that attract the right people.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-[#1F2937] mb-3">
              Discover the right people
            </h3>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              Use the explore feed, helper lists, notifications, and messaging to move quickly once a match happens.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h3 className="text-lg font-semibold text-[#1F2937] mb-3">
              Track real contribution
            </h3>
            <p className="text-[#6B7280] text-sm leading-relaxed">
              Trust scores, badges, solved requests, and rankings help the community recognize meaningful support.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
