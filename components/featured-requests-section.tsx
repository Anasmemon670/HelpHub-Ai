import Link from 'next/link'

const featuredRequests = [
  {
    id: 1,
    category: 'Web Development',
    urgency: 'High',
    status: 'Open',
    title: 'Need help making my portfolio responsive before demo day',
    description: 'My HTML/CSS portfolio breaks on tablets and I need layout guidance before tomorrow evening.',
    tags: ['HTML/CSS', 'Responsive', 'Portfolio'],
    author: 'Sara Noor',
    location: 'Karachi',
    helpers: '1 helper interested',
  },
  {
    id: 2,
    category: 'Design',
    urgency: 'Medium',
    status: 'Open',
    title: 'Looking for Figma feedback on a volunteer event poster',
    description: 'I have a draft poster for a campus community event and want sharper hierarchy, spacing, and CTA copy.',
    tags: ['Figma', 'Poster', 'Design Review'],
    author: 'Ayesha Khan',
    location: 'Lahore',
    helpers: '1 helper interested',
  },
  {
    id: 3,
    category: 'Career',
    urgency: 'Low',
    status: 'Solved',
    title: 'Need mock interview support for internship applications',
    description: 'Applying to frontend internships and need someone to practice behavioral and technical interview questions with me.',
    tags: ['Interview Prep', 'Career', 'Frontend'],
    author: 'Sara Noor',
    location: 'Remote',
    helpers: '2 helpers interested',
  },
]

function getUrgencyColor(urgency: string) {
  switch (urgency) {
    case 'High':
      return 'bg-red-50 text-red-600 border-red-200'
    case 'Medium':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    case 'Low':
      return 'bg-blue-50 text-blue-600 border-blue-200'
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'Open':
      return 'bg-green-50 text-green-600 border-green-200'
    case 'Solved':
      return 'bg-purple-50 text-purple-600 border-purple-200'
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}

export function FeaturedRequestsSection() {
  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
              Featured requests
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937]">
              Community problems currently in motion
            </h2>
          </div>
          <Link
            href="/explore"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#E5E5E0] text-[#1F2937] font-medium hover:bg-white transition-colors text-sm"
          >
            View full feed
          </Link>
        </div>

        {/* Request Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {featuredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-3xl p-6 shadow-sm flex flex-col">
              {/* Tags row */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-medium border bg-[#F5F5F0] text-[#2D8A6F] border-[#E5E5E0]">
                  {request.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}>
                  {request.urgency}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-base font-semibold text-[#1F2937] mb-2 leading-snug">
                {request.title}
              </h3>

              {/* Description */}
              <p className="text-[#6B7280] text-sm leading-relaxed mb-4 flex-grow">
                {request.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {request.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium border border-[#E5E5E0] text-[#2D8A6F] bg-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Author and action */}
              <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E0]">
                <div>
                  <p className="text-sm font-medium text-[#1F2937]">{request.author}</p>
                  <p className="text-xs text-[#6B7280]">{request.location} • {request.helpers}</p>
                </div>
                <button className="px-4 py-2 rounded-xl border border-[#E5E5E0] text-sm font-medium text-[#1F2937] hover:bg-[#F5F5F0] transition-colors">
                  Open details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
