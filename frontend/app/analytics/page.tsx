'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useAppData, useSessionUserId } from '@/lib/app-store'
import { getAnalyticsOverviewRemote, isApiConfigured } from '@/lib/remote-client'
import type { AnalyticsOverview, AppData } from '@/lib/types'

const STATUS_COLORS = ['#2D8A6F', '#D97706', '#9CA3AF']

function buildLocalAnalyticsOverview(data: AppData): AnalyticsOverview {
  const requests = data.requests
  const totalRequests = requests.length
  const byStatus = { open: 0, in_progress: 0, solved: 0 }
  const catCount = new Map<string, number>()
  const created = new Map<string, number>()
  const helped = new Map<string, number>()

  for (const r of requests) {
    if (r.status === 'Solved') byStatus.solved += 1
    else if (r.status === 'In Progress') byStatus.in_progress += 1
    else byStatus.open += 1

    const c = r.category?.trim() || 'Uncategorized'
    catCount.set(c, (catCount.get(c) || 0) + 1)

    if (r.authorId) {
      created.set(r.authorId, (created.get(r.authorId) || 0) + 1)
    }
    for (const hid of r.helperIds || []) {
      helped.set(hid, (helped.get(hid) || 0) + 1)
    }
  }

  const successRate =
    totalRequests === 0 ? 0 : Math.round((byStatus.solved / totalRequests) * 1000) / 10

  const topCategories = [...catCount.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12)

  const userIds = new Set<string>([...created.keys(), ...helped.keys()])
  const mostActiveUsers = [...userIds]
    .map((userId) => {
      const requestsCreated = created.get(userId) || 0
      const helpSessions = helped.get(userId) || 0
      const activityScore = requestsCreated + helpSessions
      const name = data.users[userId]?.name || 'Member'
      return { userId, name, requestsCreated, helpSessions, activityScore }
    })
    .filter((u) => u.activityScore > 0)
    .sort((a, b) => b.activityScore - a.activityScore)
    .slice(0, 15)

  return {
    totalRequests,
    byStatus,
    successRate,
    topCategories,
    mostActiveUsers,
  }
}

export default function AnalyticsPage() {
  const router = useRouter()
  useAppData()
  const sessionId = useSessionUserId()
  const data = useAppData()
  const dataRef = useRef(data)
  dataRef.current = data
  const [mounted, setMounted] = useState(false)
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [source, setSource] = useState<'api' | 'local' | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (sessionId === null) {
      router.replace('/login')
    }
  }, [router, sessionId])

  useEffect(() => {
    let cancelled = false
    if (sessionId === null) return

    void (async () => {
      setLoading(true)
      setOverview(null)
      setSource(null)
      if (isApiConfigured()) {
        try {
          const remote = await getAnalyticsOverviewRemote()
          if (!cancelled) {
            setOverview(remote)
            setSource('api')
          }
        } catch {
          if (!cancelled) {
            setOverview(buildLocalAnalyticsOverview(dataRef.current))
            setSource('local')
          }
        }
      } else if (!cancelled) {
        setOverview(buildLocalAnalyticsOverview(dataRef.current))
        setSource('local')
      }
      if (!cancelled) setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [sessionId])

  useEffect(() => {
    if (source !== 'local' || sessionId === null) return
    setOverview(buildLocalAnalyticsOverview(data))
  }, [source, sessionId, data.requests, data.users])

  const statusChartData = useMemo(() => {
    if (!overview) return []
    return [
      { name: 'Open', value: overview.byStatus.open },
      { name: 'In progress', value: overview.byStatus.in_progress },
      { name: 'Solved', value: overview.byStatus.solved },
    ].filter((d) => d.value > 0)
  }, [overview])

  const statusPieData = useMemo(() => {
    if (statusChartData.length) return statusChartData
    return [{ name: 'No data', value: 1 }]
  }, [statusChartData])

  const categoryChartData = useMemo(() => {
    if (!overview) return []
    return overview.topCategories.map((c) => ({
      name: c.category.length > 18 ? `${c.category.slice(0, 18)}…` : c.category,
      full: c.category,
      count: c.count,
    }))
  }, [overview])

  if (sessionId === null) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-4">
        <p className="text-[#6B7280]">Loading analytics…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
                Analytics
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-2">Platform overview</h1>
              <p className="text-[#6B7280] text-lg max-w-2xl">
                Aggregated signals from help requests—volume, outcomes, categories, and member activity.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium border border-[#E5E5E0] bg-white text-[#1F2937] hover:bg-[#F5F5F0] transition-colors shrink-0"
            >
              Back to dashboard
            </Link>
          </div>

          {source === 'local' && (
            <p className="mb-6 text-sm text-[#6B7280] bg-white rounded-xl px-4 py-3 border border-[#E5E5E0] shadow-sm">
              {isApiConfigured()
                ? 'Live API aggregates were unavailable; showing an offline snapshot from this browser’s saved data.'
                : 'API URL is not configured; showing an offline snapshot from this browser’s saved data.'}
            </p>
          )}

          {loading || !overview ? (
            <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-[#6B7280]">
              Loading metrics…
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
                    Total requests
                  </p>
                  <p className="text-3xl font-bold text-[#1F2937]">{overview.totalRequests}</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
                    Success rate
                  </p>
                  <p className="text-3xl font-bold text-[#2D8A6F]">{overview.successRate}%</p>
                  <p className="text-xs text-[#6B7280] mt-1">Solved ÷ all requests</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
                    Open pipeline
                  </p>
                  <p className="text-3xl font-bold text-[#1F2937]">
                    {overview.byStatus.open + overview.byStatus.in_progress}
                  </p>
                  <p className="text-xs text-[#6B7280] mt-1">Open + in progress</p>
                </div>
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
                    Resolved
                  </p>
                  <p className="text-3xl font-bold text-[#1F2937]">{overview.byStatus.solved}</p>
                </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#1F2937] mb-1">Request status mix</h2>
                  <p className="text-sm text-[#6B7280] mb-4">Open vs in progress vs solved</p>
                  <div className="h-72 w-full">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusPieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={56}
                            outerRadius={96}
                            paddingAngle={2}
                          >
                            {statusPieData.map((entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={
                                  statusChartData.length
                                    ? STATUS_COLORS[index % STATUS_COLORS.length]
                                    : '#E5E7EB'
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h2 className="text-lg font-semibold text-[#1F2937] mb-1">Top categories</h2>
                  <p className="text-sm text-[#6B7280] mb-4">Most common request topics</p>
                  <div className="h-72 w-full">
                    {mounted && (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryChartData.length ? categoryChartData : [{ name: '—', count: 0 }]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-18} textAnchor="end" height={64} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                          <Tooltip
                            formatter={(value: number) => [value, 'Requests']}
                            labelFormatter={(_, payload) =>
                              payload?.[0]?.payload?.full
                                ? String(payload[0].payload.full)
                                : 'Category'
                            }
                          />
                          <Bar dataKey="count" fill="#2D8A6F" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-[#1F2937] mb-1">Most active members</h2>
                <p className="text-sm text-[#6B7280] mb-4">
                  Ranked by requests created plus help sessions joined (platform-wide).
                </p>
                {overview.mostActiveUsers.length === 0 ? (
                  <p className="text-sm text-[#6B7280]">No activity recorded yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-[#6B7280] border-b border-[#E5E5E0]">
                          <th className="py-3 pr-4 font-medium">Member</th>
                          <th className="py-3 pr-4 font-medium">Requests created</th>
                          <th className="py-3 pr-4 font-medium">Help sessions</th>
                          <th className="py-3 font-medium">Activity score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {overview.mostActiveUsers.map((row) => (
                          <tr key={row.userId} className="border-b border-[#F3F4F6] text-[#1F2937]">
                            <td className="py-3 pr-4 font-medium">{row.name}</td>
                            <td className="py-3 pr-4">{row.requestsCreated}</td>
                            <td className="py-3 pr-4">{row.helpSessions}</td>
                            <td className="py-3">{row.activityScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {source === 'api' && (
                <p className="mt-6 text-xs text-[#9CA3AF]">
                  Data source: server aggregates · Refresh this page for the latest counts.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
