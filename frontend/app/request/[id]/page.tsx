'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  addChatMessage,
  ingestIncomingMessage,
  markCanHelp,
  markSolved,
  useAppData,
  useCurrentUser,
} from '@/lib/app-store'
import {
  getSocket,
  joinRequestRoom,
  onReceiveMessage,
  sendMessageRealtime,
} from '@/lib/socket-client'

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

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === 'string' ? params.id : ''
  const data = useAppData()
  const req = data.requests.find((r) => r.id === id)
  const current = useCurrentUser()
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!req) {
    return (
      <div className="min-h-screen bg-[#F5F5F0] flex flex-col items-center justify-center px-4 gap-4">
        <p className="text-[#6B7280]">This request could not be found.</p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 bg-[#2D8A6F] text-white px-6 py-3 rounded-full font-medium hover:bg-[#256F5A] transition-colors"
        >
          Back to feed
        </Link>
      </div>
    )
  }

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[#F5F5F0]">
        <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Link
                href="/explore"
                className="text-sm font-medium text-[#2D8A6F] hover:underline"
              >
                ← Back to feed
              </Link>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm text-center text-[#6B7280]">
              Loading…
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isAuthor = current && req.authorId === current.id
  const isHelper = current && req.helperIds.includes(current.id)
  const canAct = !!current
  const helpersLabel = `${req.helperIds.length} helper${req.helperIds.length === 1 ? '' : 's'} interested`

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotice(null)
    if (!current) {
      router.push('/login')
      return
    }
    if (!message.trim()) return
    const outgoing = message
    const realTime = await sendMessageRealtime(req.id, outgoing)
    if (realTime.ok && realTime.message) {
      ingestIncomingMessage(req.id, realTime.message)
    } else {
      await addChatMessage(req.id, current.id, outgoing)
    }
    setMessage('')
  }

  const onHelp = async () => {
    setNotice(null)
    if (!current) {
      router.push('/login')
      return
    }
    const ok = await markCanHelp(req.id, current.id)
    if (!ok) {
      setNotice('You are already helping, or you authored this request.')
    }
  }

  const onSolved = async () => {
    setNotice(null)
    if (!current) {
      router.push('/login')
      return
    }
    const ok = await markSolved(req.id, current.id)
    if (!ok) {
      setNotice('Only the author or a helper can mark this solved.')
    }
  }

  useEffect(() => {
    if (!current) return
    const socket = getSocket()
    if (!socket) return
    const onConnect = () => joinRequestRoom(req.id)
    if (socket.connected) {
      joinRequestRoom(req.id)
    } else {
      socket.on('connect', onConnect)
    }
    const off = onReceiveMessage((incoming) => {
      if (incoming.requestId !== req.id) return
      ingestIncomingMessage(req.id, incoming)
    })
    return () => {
      socket.off('connect', onConnect)
      off()
    }
  }, [current, req.id])

  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              href="/explore"
              className="text-sm font-medium text-[#2D8A6F] hover:underline"
            >
              ← Back to feed
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-medium border bg-[#F5F5F0] text-[#2D8A6F] border-[#E5E5E0]">
                {req.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(req.urgency)}`}>
                {req.urgency}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(req.status)}`}>
                {req.status}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1F2937] mb-4">{req.title}</h1>
            <p className="text-[#6B7280] leading-relaxed mb-6">{req.description}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {req.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-medium border border-[#E5E5E0] text-[#2D8A6F] bg-white"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-[#E5E5E0]">
              <div>
                <p className="text-sm font-medium text-[#1F2937]">{req.authorName}</p>
                <p className="text-xs text-[#6B7280]">
                  {req.location} · {helpersLabel}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onHelp}
                  disabled={!canAct || req.status === 'Solved' || !!isAuthor || !!isHelper}
                  className="px-4 py-2 rounded-xl bg-[#2D8A6F] text-white text-sm font-medium hover:bg-[#256F5A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isHelper ? 'You are helping' : 'I can help'}
                </button>
                <button
                  type="button"
                  onClick={onSolved}
                  disabled={!canAct || req.status === 'Solved' || (!isAuthor && !isHelper)}
                  className="px-4 py-2 rounded-xl border border-[#E5E5E0] text-sm font-medium text-[#1F2937] hover:bg-[#F5F5F0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark as solved
                </button>
              </div>
            </div>
            {notice && <p className="text-sm text-red-600 mt-4">{notice}</p>}
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-[#1F2937] mb-4">Chat & actions</h2>
            <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-1">
              {req.messages.length === 0 && (
                <p className="text-sm text-[#6B7280]">No messages yet. Say hello or offer specifics below.</p>
              )}
              {req.messages.map((m) => (
                <div key={m.id} className="rounded-2xl border border-[#E5E5E0] p-4 bg-[#F5F5F0]/50">
                  <p className="text-xs font-semibold text-[#2D8A6F] mb-1">
                    {m.authorName}{' '}
                    <span className="font-normal text-[#9CA3AF]">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </p>
                  <p className="text-sm text-[#1F2937] whitespace-pre-wrap">{m.body}</p>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={current ? 'Write a message…' : 'Sign in to participate'}
                disabled={!current}
                className="flex-1 px-4 py-3 rounded-xl border border-[#E5E5E0] bg-white text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2D8A6F] focus:border-transparent disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!current}
                className="px-6 py-3 rounded-xl bg-[#2D8A6F] text-white font-medium hover:bg-[#256F5A] transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </form>
            {!current && (
              <p className="text-sm text-[#6B7280] mt-3">
                <Link href="/login" className="text-[#2D8A6F] font-medium">
                  Sign in
                </Link>{' '}
                or{' '}
                <Link href="/join" className="text-[#2D8A6F] font-medium">
                  join
                </Link>{' '}
                to message this thread.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
