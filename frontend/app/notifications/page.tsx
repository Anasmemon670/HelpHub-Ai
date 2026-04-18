'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  getNotificationsForUser,
  markNotificationsRead,
  useSessionUserId,
} from '@/lib/app-store'
import type { NotificationItem } from '@/lib/types'

export default function NotificationsPage() {
  const sessionId = useSessionUserId()
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!sessionId) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const res = await getNotificationsForUser(sessionId)
    setItems(res.notifications)
    setLoading(false)
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])

  const unreadCount = useMemo(
    () => items.reduce((acc, item) => acc + (item.read ? 0 : 1), 0),
    [items]
  )

  const markAllRead = async () => {
    if (!sessionId) return
    await markNotificationsRead({ userId: sessionId, readAll: true })
    await load()
  }

  const markOneRead = async (id: string) => {
    if (!sessionId) return
    await markNotificationsRead({ userId: sessionId, notificationId: id })
    await load()
  }

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold tracking-wider text-[#2D8A6F] uppercase mb-2">
              Notifications
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#1F2937] mb-3">
              Live community signals
            </h1>
            <p className="text-[#6B7280]">
              Stay updated when helpers engage your requests and when relevant requests are posted.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm mb-6 flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">
              Unread notifications: <span className="font-semibold text-[#1F2937]">{unreadCount}</span>
            </p>
            <button
              type="button"
              onClick={markAllRead}
              className="px-4 py-2 rounded-xl border border-[#E5E5E0] text-sm font-medium text-[#1F2937] hover:bg-[#F5F5F0] transition-colors"
            >
              Mark all as read
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl p-8 shadow-sm text-[#6B7280]">Loading notifications…</div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <p className="text-[#6B7280]">No notifications yet.</p>
              <Link href="/explore" className="inline-block mt-4 text-sm font-medium text-[#2D8A6F] hover:underline">
                Explore requests
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-3xl p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1F2937]">{item.title}</p>
                      <p className="text-sm text-[#6B7280] mt-1">{item.message}</p>
                      <p className="text-xs text-[#9CA3AF] mt-2">
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!item.read && (
                      <button
                        type="button"
                        onClick={() => markOneRead(item.id)}
                        className="px-3 py-1.5 rounded-lg border border-[#E5E5E0] text-xs font-medium text-[#1F2937] hover:bg-[#F5F5F0] transition-colors"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                  {item.requestId && (
                    <Link
                      href={`/request/${item.requestId}`}
                      className="inline-block mt-3 text-xs font-medium text-[#2D8A6F] hover:underline"
                    >
                      Open related request
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
