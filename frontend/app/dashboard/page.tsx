'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { RequestModal } from '@/components/request-modal'
import {
  getNotificationsForUser,
  useAppData,
  useCurrentUser,
  useSessionUserId,
} from '@/lib/app-store'

export default function DashboardPage() {
  const router = useRouter()
  const data = useAppData()
  const [modalOpen, setModalOpen] = useState(false)
  const [latestNotifications, setLatestNotifications] = useState<Array<{ id: string; title: string; message: string }>>(
    []
  )
  const sessionId = useSessionUserId()
  const user = useCurrentUser()

  const stats = useMemo(() => {
    const total = data.requests.length
    const solved = data.requests.filter((r) => r.status === 'Solved').length
    const active = data.requests.filter((r) => r.status !== 'Solved').length
    return { total, solved, active }
  }, [data.requests])

  const helpingCount = useMemo(() => {
    if (!user) return 0
    return data.requests.filter((r) => r.status !== 'Solved' && r.helperIds.includes(user.id)).length
  }, [data.requests, user])

  const aiPulse = useMemo(() => {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return data.requests.filter(
      (r) => new Date(r.createdAt).getTime() >= sevenDaysAgo && (r.urgency === 'High' || r.tags.length >= 2)
    ).length
  }, [data.requests])

  const recentRequests = useMemo(() => {
    return [...data.requests]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
  }, [data.requests])

  const aiInsights = useMemo(() => {
    const suggestions: string[] = []
    if (stats.active > 0) suggestions.push('Focus on active requests to improve resolution speed.')
    if (helpingCount === 0) suggestions.push('Join at least one request to increase helper momentum.')
    if (aiPulse > 2) suggestions.push('AI pulse is high this week; prioritize urgent requests first.')
    if (!suggestions.length) suggestions.push('Great momentum. Keep supporting requests consistently.')
    return suggestions.slice(0, 3)
  }, [stats.active, helpingCount, aiPulse])

  useEffect(() => {
    if (sessionId === null) {
      router.replace('/login')
    }
  }, [router, sessionId])

  useEffect(() => {
    let cancelled = false
    if (!sessionId) return
    void (async () => {
      const res = await getNotificationsForUser(sessionId)
      if (!cancelled) {
        setLatestNotifications(
          res.notifications.slice(0, 3).map((n) => ({
            id: n.id,
            title: n.title,
            message: n.message,
          }))
        )
      }
    })()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  if (sessionId === null || !user) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-4">
        <p className="text-[#6B7280]">Loading dashboard…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
              Dashboard
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-2">
              Welcome back, {user.name}
            </h1>
            <p className="text-[#6B7280] text-lg">
              Your command center for requests, AI insights, helper momentum, and live community activity.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
                Trust score
              </p>
              <p className="text-3xl font-bold text-[#2D8A6F]">{user.trustScore}%</p>
              <p className="text-xs text-[#6B7280] mt-1">Driven by solved requests and consistent support.</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
                Helping
              </p>
              <p className="text-3xl font-bold text-[#1F2937]">{helpingCount}</p>
              <p className="text-xs text-[#6B7280] mt-1">Requests where you are currently listed as a helper.</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
                Open requests
              </p>
              <p className="text-3xl font-bold text-[#1F2937]">{stats.active}</p>
              <p className="text-xs text-[#6B7280] mt-1">Community requests currently active across the feed.</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
                AI pulse
              </p>
              <p className="text-3xl font-bold text-[#1F2937]">{aiPulse}</p>
              <p className="text-xs text-[#6B7280] mt-1">Trend count detected in the latest request activity.</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
                  Recent requests
                </p>
                <h2 className="text-xl font-bold text-[#1F2937] mb-4">What the community needs right now</h2>
              </div>
              <div className="space-y-3 mb-5">
                {recentRequests.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">No requests yet.</p>
                ) : (
                  recentRequests.map((r) => (
                    <div key={r.id} className="rounded-xl border border-[#E5E5E0] px-4 py-3">
                      <p className="font-medium text-[#1F2937]">{r.title}</p>
                      <p className="text-xs text-[#6B7280] mt-1">
                        {r.category} • {r.status}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <Link
                href="/explore"
                className="inline-flex items-center justify-center gap-2 bg-[#2D8A6F] text-white px-6 py-3 rounded-full font-medium hover:bg-[#256F5A] transition-colors"
              >
                Go to feed
              </Link>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">AI insights</p>
                <h2 className="text-xl font-bold text-[#1F2937] mb-4">Suggested actions for you</h2>
                <div className="space-y-3">
                  {aiInsights.map((insight) => (
                    <p key={insight} className="text-sm text-[#6B7280]">
                      • {insight}
                    </p>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
                <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">Notifications</p>
                <h2 className="text-xl font-bold text-[#1F2937] mb-4">Latest updates</h2>
                <div className="space-y-3">
                  {latestNotifications.length === 0 ? (
                    <p className="text-sm text-[#6B7280]">No new updates yet.</p>
                  ) : (
                    latestNotifications.map((item) => (
                      <div key={item.id} className="rounded-xl border border-[#E5E5E0] px-4 py-3">
                        <p className="font-medium text-[#1F2937]">{item.title}</p>
                        <p className="text-sm text-[#6B7280] mt-1">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-10">
            <Link
              href="/analytics"
              className="inline-flex items-center gap-2 bg-[#1F2937] text-white px-6 py-3 rounded-full font-medium hover:bg-[#111827] transition-colors"
            >
              Analytics
            </Link>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 bg-white text-[#1F2937] px-6 py-3 rounded-full font-medium border border-[#E5E5E0] hover:bg-[#F5F5F0] transition-colors"
            >
              Create Request
            </button>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium border border-[#E5E5E0] text-[#1F2937] hover:bg-white transition-colors"
            >
              Profile
            </Link>
          </div>
        </div>
      </div>

      <RequestModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
