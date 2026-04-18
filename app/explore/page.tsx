'use client'

import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { RequestModal } from '@/components/request-modal'

const allRequests = [
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
  {
    id: 4,
    category: 'Backend',
    urgency: 'High',
    status: 'Open',
    title: 'Help needed with Node.js API authentication',
    description: 'Building a REST API and struggling with JWT implementation and middleware setup.',
    tags: ['Node.js', 'JWT', 'API'],
    author: 'Ahmed Malik',
    location: 'Islamabad',
    helpers: '3 helpers interested',
  },
  {
    id: 5,
    category: 'Mobile',
    urgency: 'Medium',
    status: 'Open',
    title: 'React Native navigation issues on Android',
    description: 'Stack navigator not working correctly when deep linking from notifications.',
    tags: ['React Native', 'Navigation', 'Android'],
    author: 'Fatima Ali',
    location: 'Karachi',
    helpers: '0 helpers interested',
  },
  {
    id: 6,
    category: 'Design',
    urgency: 'Low',
    status: 'Open',
    title: 'UI review for e-commerce checkout flow',
    description: 'Need someone experienced to review my checkout design for usability issues.',
    tags: ['UI/UX', 'E-commerce', 'Review'],
    author: 'Zain Abbas',
    location: 'Lahore',
    helpers: '1 helper interested',
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

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const categories = ['All', 'Web Development', 'Design', 'Career', 'Backend', 'Mobile']

  const filteredRequests = allRequests.filter((request) => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || request.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
              Explore
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
              Browse all community requests
            </h1>
            <p className="text-[#6B7280] text-lg">
              Find requests that match your skills and interests.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-2xl p-4 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E5E5E0] bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2D8A6F] focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                <Filter className="w-5 h-5 text-[#6B7280] flex-shrink-0" />
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-[#2D8A6F] text-white'
                        : 'bg-[#F5F5F0] text-[#6B7280] hover:bg-[#E5E5E0]'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action button */}
          <div className="mb-8">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#2D8A6F] text-white px-6 py-3 rounded-full font-medium hover:bg-[#256F5A] transition-colors"
            >
              Post a new request
            </button>
          </div>

          {/* Request Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => (
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

          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#6B7280] text-lg">No requests found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      <RequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
