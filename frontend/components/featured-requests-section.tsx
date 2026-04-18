'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { getServerSnapshot, sortRequestsForFeed, useAppData } from '@/lib/app-store'

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

export function FeaturedRequestsSection() {
  const [mounted, setMounted] = useState(false)
  const data = useAppData()
  const liveFeaturedRequests = useMemo(
    () => sortRequestsForFeed([...data.requests]).slice(0, 3),
    [data.requests]
  )
  const serverFeaturedRequests = useMemo(() => {
    const server = getServerSnapshot()
    return sortRequestsForFeed([...server.requests]).slice(0, 3)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const featuredRequests = mounted ? liveFeaturedRequests : serverFeaturedRequests

  return (
    <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
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

        <div className="grid md:grid-cols-3 gap-6">
          {featuredRequests.map((request) => {
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
      </div>
    </section>
  )
}
