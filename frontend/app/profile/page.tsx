'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Star } from 'lucide-react'
import { useAppData, useCurrentUser, useSessionUserId } from '@/lib/app-store'

export default function ProfilePage() {
  const router = useRouter()
  useAppData()
  const sessionId = useSessionUserId()
  const user = useCurrentUser()

  useEffect(() => {
    if (sessionId === null) {
      router.replace('/login')
    }
  }, [router, sessionId])

  if (sessionId === null || !user) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-4">
        <p className="text-[#6B7280]">Loading profile…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
              Profile
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-2">{user.name}</h1>
            <p className="text-[#6B7280]">
              {user.role} · {user.location} · {user.email}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Trust & contributions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs font-semibold text-[#2D8A6F] uppercase mb-1">Trust score</p>
                <p className="text-2xl font-bold text-[#1F2937]">{user.trustScore}%</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#2D8A6F] uppercase mb-1">Helping actions</p>
                <p className="text-2xl font-bold text-[#1F2937]">{user.helpedCount}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#2D8A6F] uppercase mb-1">Solved</p>
                <p className="text-2xl font-bold text-[#1F2937]">{user.solvedCount}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-[#2D8A6F] uppercase mb-1">Total contributions</p>
                <p className="text-2xl font-bold text-[#1F2937]">{user.contributions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full text-xs font-medium border border-[#E5E5E0] text-[#2D8A6F] bg-[#F5F5F0]"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm mb-8">
            <h2 className="text-lg font-semibold text-[#1F2937] mb-4">Badges</h2>
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F5F0] text-[#2D8A6F] border border-[#E5E5E0]"
                >
                  <Star className="w-3 h-3" />
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 bg-[#2D8A6F] text-white px-6 py-3 rounded-full font-medium hover:bg-[#256F5A] transition-colors"
            >
              Browse feed
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium border border-[#E5E5E0] text-[#1F2937] hover:bg-white transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
