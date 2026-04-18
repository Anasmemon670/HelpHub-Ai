'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { getJwt, isApiConfigured } from '@/lib/remote-client'
import { useCurrentUser } from '@/lib/app-store'
import type { HelpRequest, User } from '@/lib/types'

async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
  const token = getJwt()
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  })
  const text = await res.text()
  if (!res.ok) throw new Error(text || res.statusText)
  return (text ? JSON.parse(text) : {}) as T
}

export default function AdminPage() {
  const router = useRouter()
  const user = useCurrentUser()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{ totalUsers: number; totalRequests: number; activeRequests: number } | null>(
    null
  )
  const [users, setUsers] = useState<User[]>([])
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [error, setError] = useState<string | null>(null)

  const isAdmin = !!user?.isAdmin

  useEffect(() => {
    if (!user) return
    if (!isAdmin) {
      router.replace('/dashboard')
    }
  }, [router, user, isAdmin])

  const canUseApi = useMemo(() => isApiConfigured() && !!getJwt(), [])

  const refresh = async () => {
    setError(null)
    if (!canUseApi) {
      setError('Admin requires API mode (NEXT_PUBLIC_API_URL) and an authenticated session.')
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const [s, u, r] = await Promise.all([
        apiJson<{ totalUsers: number; totalRequests: number; activeRequests: number }>('/api/admin/stats'),
        apiJson<{ users: User[] }>('/api/admin/users'),
        apiJson<{ requests: HelpRequest[] }>('/api/admin/requests'),
      ])
      setStats(s)
      setUsers(u.users || [])
      setRequests(r.requests || [])
      setLoading(false)
    } catch (e) {
      setError('Failed to load admin data.')
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user || !isAdmin) return
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAdmin])

  const deleteRequest = async (id: string) => {
    try {
      await apiJson(`/api/admin/request/${id}`, { method: 'DELETE' })
      await refresh()
    } catch {
      setError('Delete failed.')
    }
  }

  const markReviewed = async (id: string) => {
    try {
      await apiJson(`/api/admin/request/${id}/review`, { method: 'PATCH' })
      await refresh()
    } catch {
      setError('Mark reviewed failed.')
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-4">
        <p className="text-[#6B7280]">Loading…</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex items-center justify-center px-4">
        <p className="text-[#6B7280]">Redirecting…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">Admin</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-2">Platform control panel</h1>
            <p className="text-[#6B7280] text-lg">Moderate requests and monitor platform health.</p>
          </div>

          {error && (
            <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">Total users</p>
              <p className="text-3xl font-bold text-[#1F2937]">{stats?.totalUsers ?? '—'}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">Total requests</p>
              <p className="text-3xl font-bold text-[#1F2937]">{stats?.totalRequests ?? '—'}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">Active requests</p>
              <p className="text-3xl font-bold text-[#1F2937]">{stats?.activeRequests ?? '—'}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">Admin user</p>
              <p className="text-sm font-semibold text-[#1F2937] truncate">{user.email}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-10">
            <div className="p-6 border-b border-[#E5E5E0] flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-[#1F2937]">Manage requests</h2>
              <button
                type="button"
                onClick={refresh}
                className="px-4 py-2 rounded-xl border border-[#E5E5E0] text-sm font-medium text-[#1F2937] hover:bg-[#F5F5F0] transition-colors"
              >
                Refresh
              </button>
            </div>
            <div className="divide-y divide-[#E5E5E0]">
              {loading ? (
                <div className="p-6 text-[#6B7280]">Loading…</div>
              ) : requests.length === 0 ? (
                <div className="p-6 text-[#6B7280]">No requests found.</div>
              ) : (
                requests.slice(0, 30).map((r) => (
                  <div key={r.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#1F2937] truncate">{r.title}</p>
                      <p className="text-sm text-[#6B7280] truncate">
                        {r.category} · {r.status} · {r.reviewed ? 'Reviewed' : 'Unreviewed'}
                      </p>
                      <Link href={`/request/${r.id}`} className="text-xs font-medium text-[#2D8A6F] hover:underline">
                        Open
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => markReviewed(r.id)}
                        className="px-4 py-2 rounded-xl border border-[#E5E5E0] text-sm font-medium text-[#1F2937] hover:bg-[#F5F5F0] transition-colors"
                      >
                        Mark reviewed
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteRequest(r.id)}
                        className="px-4 py-2 rounded-xl bg-[#1F2937] text-white text-sm font-medium hover:opacity-90 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#E5E5E0]">
              <h2 className="text-xl font-semibold text-[#1F2937]">Manage users</h2>
            </div>
            <div className="divide-y divide-[#E5E5E0]">
              {loading ? (
                <div className="p-6 text-[#6B7280]">Loading…</div>
              ) : (
                users.slice(0, 50).map((u) => (
                  <div key={u.id} className="p-6 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1F2937] truncate">{u.name}</p>
                      <p className="text-sm text-[#6B7280] truncate">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#2D8A6F]">{u.trustScore}%</p>
                      <p className="text-xs text-[#6B7280]">{u.isAdmin ? 'Admin' : 'User'}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

