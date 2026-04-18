'use client'

import { useMemo } from 'react'
import { Trophy, Medal, Star, TrendingUp } from 'lucide-react'
import { getStats, useAppData } from '@/lib/app-store'

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return <Trophy className="w-6 h-6 text-yellow-500" />
    case 2:
      return <Medal className="w-6 h-6 text-gray-400" />
    case 3:
      return <Medal className="w-6 h-6 text-amber-600" />
    default:
      return <span className="text-lg font-bold text-[#6B7280]">{rank}</span>
  }
}

export default function LeaderboardPage() {
  const data = useAppData()
  const stats = getStats()
  const rows = useMemo(() => {
    const list = Object.values(data.users)
      .map((u) => ({
        ...u,
        requestsSolved: u.solvedCount,
      }))
      .sort((a, b) => b.trustScore - a.trustScore)
    return list.map((u, i) => ({ ...u, rank: i + 1 }))
  }, [data.users])

  const avgTrust =
    rows.length === 0
      ? 0
      : Math.round(rows.reduce((s, u) => s + u.trustScore, 0) / rows.length)
  const badgeTotal = rows.reduce((s, u) => s + u.badges.length, 0)
  const weeklySolved = stats.solved

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
              Leaderboard
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-4">
              Top community contributors
            </h1>
            <p className="text-[#6B7280] text-lg">
              Celebrating helpers who make a real difference in our community.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
                Total Helpers
              </p>
              <p className="text-3xl font-bold text-[#1F2937]">{rows.length}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
                Avg Trust Score
              </p>
              <p className="text-3xl font-bold text-[#1F2937]">{avgTrust}%</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
                Solved (platform)
              </p>
              <p className="text-3xl font-bold text-[#1F2937]">{weeklySolved}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
                Badges Earned
              </p>
              <p className="text-3xl font-bold text-[#1F2937]">{badgeTotal}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#E5E5E0]">
              <h2 className="text-xl font-semibold text-[#1F2937]">Weekly Rankings</h2>
            </div>
            <div className="divide-y divide-[#E5E5E0]">
              {rows.map((user) => (
                <div
                  key={user.id}
                  className={`p-6 flex items-center gap-4 hover:bg-[#F5F5F0] transition-colors ${
                    user.rank <= 3 ? 'bg-[#F5F5F0]/50' : ''
                  }`}
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getRankIcon(user.rank)}
                  </div>

                  <div className="w-12 h-12 bg-[#2D8A6F] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {user.name
                        .split(' ')
                        .map((p) => p[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#1F2937]">{user.name}</h3>
                      {user.rank <= 3 && <TrendingUp className="w-4 h-4 text-green-500" />}
                    </div>
                    <p className="text-sm text-[#6B7280]">{user.location}</p>
                  </div>

                  <div className="hidden md:flex flex-wrap gap-2 max-w-xs">
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

                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#2D8A6F]">{user.trustScore}%</p>
                    <p className="text-xs text-[#6B7280]">{user.requestsSolved} solved</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
