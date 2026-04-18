'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, Filter } from 'lucide-react'
import { RequestModal } from '@/components/request-modal'
import { sortRequestsForFeed, useAppData } from '@/lib/app-store'
import type { UrgencyLevel } from '@/lib/types'

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
    case 'In Progress':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Solved':
      return 'bg-purple-50 text-purple-600 border-purple-200'
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200'
  }
}

export default function ExplorePage() {
  const data = useAppData()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedUrgency, setSelectedUrgency] = useState<'All' | UrgencyLevel>('All')
  const [skillsFilter, setSkillsFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const categories = ['All', 'Web Development', 'Design', 'Career', 'Backend', 'Mobile', 'Other']

  const filteredRequests = useMemo(() => {
    const q = searchQuery.toLowerCase()
    const skill = skillsFilter.toLowerCase().trim()
    const list = data.requests.filter((request) => {
      const matchesSearch =
        !q ||
        request.title.toLowerCase().includes(q) ||
        request.description.toLowerCase().includes(q)
      const matchesCategory = selectedCategory === 'All' || request.category === selectedCategory
      const matchesUrgency = selectedUrgency === 'All' || request.urgency === selectedUrgency
      const matchesSkills =
        !skill ||
        request.tags.some((t) => t.toLowerCase().includes(skill)) ||
        request.title.toLowerCase().includes(skill) ||
        request.description.toLowerCase().includes(skill)
      return matchesSearch && matchesCategory && matchesUrgency && matchesSkills
    })
    return sortRequestsForFeed(list)
  }, [data.requests, searchQuery, selectedCategory, selectedUrgency, skillsFilter])

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
                    type="button"
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
            <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center">
              <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Urgency</p>
              <div className="flex flex-wrap gap-2">
                {(['All', 'High', 'Medium', 'Low'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setSelectedUrgency(u)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      selectedUrgency === u
                        ? 'bg-[#1F2937] text-white border-[#1F2937]'
                        : 'bg-white text-[#6B7280] border-[#E5E5E0] hover:bg-[#F5F5F0]'
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                Skills / tags
              </label>
              <input
                type="text"
                value={skillsFilter}
                onChange={(e) => setSkillsFilter(e.target.value)}
                placeholder="Filter by skill or tag (e.g. React, Figma)"
                className="w-full px-4 py-3 rounded-xl border border-[#E5E5E0] bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2D8A6F] focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-8">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-[#2D8A6F] text-white px-6 py-3 rounded-full font-medium hover:bg-[#256F5A] transition-colors"
            >
              Post a new request
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => {
              const n = request.helperIds.length
              const helpersLabel = `${n} helper${n === 1 ? '' : 's'} interested`
              return (
                <div key={request.id} className="bg-white rounded-3xl p-6 shadow-sm flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium border bg-[#F5F5F0] text-[#2D8A6F] border-[#E5E5E0]">
                      {request.category}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}
                    >
                      {request.urgency}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[#1F2937] mb-2 leading-snug">{request.title}</h3>

                  <p className="text-[#6B7280] text-sm leading-relaxed mb-4 flex-grow">
                    {request.description}
                  </p>

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

                  <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E0]">
                    <div>
                      <p className="text-sm font-medium text-[#1F2937]">{request.authorName}</p>
                      <p className="text-xs text-[#6B7280]">
                        {request.location} · {helpersLabel}
                      </p>
                    </div>
                    <Link
                      href={`/request/${request.id}`}
                      className="px-4 py-2 rounded-xl border border-[#E5E5E0] text-sm font-medium text-[#1F2937] hover:bg-[#F5F5F0] transition-colors"
                    >
                      Open details
                    </Link>
                  </div>
                </div>
              )
            })}
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
