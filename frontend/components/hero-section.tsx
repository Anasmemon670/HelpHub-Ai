'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { RequestModal } from './request-modal'
import { getServerSnapshot, getStats, useAppData } from '@/lib/app-store'

export function HeroSection() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const data = useAppData()
  const serverSnapshot = useMemo(() => getServerSnapshot(), [])
  const liveStats = getStats()
  const liveMemberCount = Object.keys(data.users).length
  const liveTopTrust = useMemo(() => {
    const scores = Object.values(data.users).map((u) => u.trustScore)
    if (!scores.length) return 0
    return Math.max(...scores)
  }, [data.users])
  const serverStats = useMemo(() => {
    const total = serverSnapshot.requests.length
    const solved = serverSnapshot.requests.filter((r) => r.status === 'Solved').length
    const active = serverSnapshot.requests.filter((r) => r.status !== 'Solved').length
    return { total, solved, active }
  }, [serverSnapshot])
  const serverMemberCount = useMemo(
    () => Object.keys(serverSnapshot.users).length,
    [serverSnapshot]
  )
  const serverTopTrust = useMemo(() => {
    const scores = Object.values(serverSnapshot.users).map((u) => u.trustScore)
    if (!scores.length) return 0
    return Math.max(...scores)
  }, [serverSnapshot])

  useEffect(() => {
    setMounted(true)
  }, [])

  const stats = mounted ? liveStats : serverStats
  const memberCount = mounted ? liveMemberCount : serverMemberCount
  const topTrust = mounted ? liveTopTrust : serverTopTrust

  return (
    <>
      <section className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Left Column - Main Content */}
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-4">
                SMIT Grand Coding Night 2026
              </p>
              
              <h1 className="text-4xl md:text-5xl font-bold text-[#1F2937] leading-tight mb-6">
                Find help faster.<br />
                Become help that matters.
              </h1>
              
              <p className="text-[#6B7280] text-base md:text-lg leading-relaxed mb-8">
                HelpHub AI is a community-powered support network for students, mentors, creators, and builders. Ask for help, offer help, track impact, and let AI surface smarter matches across the platform.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-2 bg-[#2D8A6F] text-white px-6 py-3 rounded-full font-medium hover:bg-[#256F5A] transition-colors"
                >
                  Open product demo
                </Link>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-transparent text-[#1F2937] px-6 py-3 rounded-full font-medium border border-[#E5E5E0] hover:bg-[#F5F5F0] transition-colors"
                >
                  Post a request
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#F5F5F0] rounded-2xl p-5">
                  <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">Members</p>
                  <p className="text-3xl font-bold text-[#1F2937]">{memberCount}</p>
                  <p className="text-sm text-[#6B7280] mt-1">Students, mentors, and helpers in the loop.</p>
                </div>
                <div className="bg-[#F5F5F0] rounded-2xl p-5">
                  <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">Requests</p>
                  <p className="text-3xl font-bold text-[#1F2937]">{stats.total}</p>
                  <p className="text-sm text-[#6B7280] mt-1">Support posts shared across learning journeys.</p>
                </div>
                <div className="bg-[#F5F5F0] rounded-2xl p-5">
                  <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">Solved</p>
                  <p className="text-3xl font-bold text-[#1F2937]">{stats.solved}</p>
                  <p className="text-sm text-[#6B7280] mt-1">Problems resolved through fast community action.</p>
                </div>
              </div>
            </div>

            {/* Right Column - Live Product Feel Card */}
            <div className="bg-[#3D4F4F] rounded-3xl p-8 md:p-10 text-white relative overflow-hidden">
              {/* Yellow accent circle */}
              <div className="absolute top-6 right-6 w-16 h-16 bg-[#F5D76E] rounded-full opacity-90" />
              
              <p className="text-xs font-semibold tracking-wider text-white/70 uppercase mb-4">
                Live product feel
              </p>
              
              <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
                More than a form. More like an ecosystem.
              </h2>
              
              <p className="text-white/70 text-sm md:text-base leading-relaxed mb-8">
                A polished multi-page experience inspired by product platforms, with AI summaries, trust scores, contribution signals, notifications, and leaderboard momentum built directly in HTML, CSS, JavaScript, and LocalStorage.
              </p>

              {/* Feature cards */}
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                  <h3 className="font-semibold text-white mb-2">AI request intelligence</h3>
                  <p className="text-white/70 text-sm">
                    Auto-categorization, urgency detection, tags, rewrite suggestions, and trend snapshots.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                  <h3 className="font-semibold text-white mb-2">Community trust graph</h3>
                  <p className="text-white/70 text-sm">
                    Badges, helper rankings, trust score boosts, and visible contribution history.
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                  <p className="text-2xl font-bold text-white mb-1">{topTrust}%</p>
                  <p className="text-white/70 text-sm">
                    Top trust score currently active across the sample mentor network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <RequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
