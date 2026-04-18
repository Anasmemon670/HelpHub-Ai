/**
 * Domain API helpers — when NEXT_PUBLIC_API_URL is unset, callers use offline localStorage logic.
 * Auth passwords for API accounts are stored locally (same browser) for email-only login UX.
 */

import { apiFetch, isApiConfigured } from './api-client'
import type { AiAnalysisResult } from './ai-rules'
import type {
  AnalyticsOverview,
  AppData,
  HelpRequest,
  Message,
  NotificationItem,
  User,
  UrgencyLevel,
} from './types'

export { getJwt, setJwt, isApiConfigured, getApiBaseUrl } from './api-client'
export { JWT_KEY }

function pwKey(email: string): string {
  return `helphub_api_pw_${email.toLowerCase().trim()}`
}

export function storeApiPassword(email: string, password: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(pwKey(email), password)
}

export function getApiPassword(email: string): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(pwKey(email))
}

function normalizeUser(u: Record<string, unknown>): User {
  return {
    id: String(u.id),
    name: String(u.name ?? ''),
    email: String(u.email ?? ''),
    role: String(u.role ?? 'Member'),
    skills: Array.isArray(u.skills) ? (u.skills as string[]) : [],
    trustScore: Number(u.trustScore ?? 70),
    contributions: Number(u.contributions ?? 0),
    helpedCount: Number(u.helpedCount ?? 0),
    solvedCount: Number(u.solvedCount ?? 0),
    badges: Array.isArray(u.badges) ? (u.badges as string[]) : [],
    location: String(u.location ?? 'Remote'),
    lastActiveAt: String(u.lastActiveAt ?? new Date().toISOString()),
    ...(typeof u.isAdmin === 'boolean' ? { isAdmin: u.isAdmin } : {}),
  }
}

function normalizeRequest(r: Record<string, unknown>): HelpRequest {
  return {
    id: String(r.id),
    title: String(r.title ?? ''),
    description: String(r.description ?? ''),
    category: String(r.category ?? ''),
    urgency: (r.urgency as HelpRequest['urgency']) || 'Medium',
    status: (r.status as HelpRequest['status']) || 'Open',
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    authorId: String(r.authorId ?? ''),
    authorName: String(r.authorName ?? ''),
    location: String(r.location ?? 'Remote'),
    helperIds: Array.isArray(r.helperIds) ? (r.helperIds as string[]) : [],
    messages: Array.isArray(r.messages) ? (r.messages as HelpRequest['messages']) : [],
    createdAt: String(r.createdAt ?? new Date().toISOString()),
  }
}

function normalizeNotification(n: Record<string, unknown>): NotificationItem {
  return {
    id: String(n.id),
    userId: String(n.userId),
    type: (n.type as NotificationItem['type']) || 'system',
    title: String(n.title ?? ''),
    message: String(n.message ?? ''),
    requestId: n.requestId ? String(n.requestId) : null,
    category: n.category ? String(n.category) : null,
    read: Boolean(n.read),
    createdAt: String(n.createdAt ?? new Date().toISOString()),
  }
}

function normalizeMessage(m: Record<string, unknown>): Message {
  return {
    id: String(m.id),
    requestId: String(m.requestId ?? ''),
    authorId: String(m.authorId ?? ''),
    authorName: String(m.authorName ?? ''),
    body: String(m.body ?? ''),
    createdAt: String(m.createdAt ?? new Date().toISOString()),
  }
}

export async function pullRemoteState(): Promise<AppData | null> {
  if (!isApiConfigured()) return null
  try {
    const [reqRes, userRes] = await Promise.all([
      apiFetch<{ requests: Record<string, unknown>[] }>('/api/requests'),
      apiFetch<{ users: Record<string, unknown>[] }>('/api/users'),
    ])
    const users: Record<string, User> = {}
    for (const u of userRes.users || []) {
      const nu = normalizeUser(u)
      users[nu.id] = nu
    }
    const requests = (reqRes.requests || []).map((r) => normalizeRequest(r))
    return { users, requests }
  } catch {
    return null
  }
}

export async function authRegister(body: {
  name: string
  email: string
  password: string
  role: string
  skills: string
}): Promise<{ token: string; user: User }> {
  const skillsArr = body.skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const res = await apiFetch<{ token: string; user: Record<string, unknown> }>(
    '/api/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
        skills: skillsArr,
      }),
    },
    false
  )
  return { token: res.token, user: normalizeUser(res.user) }
}

export async function authLogin(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await apiFetch<{ token: string; user: Record<string, unknown> }>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    false
  )
  return { token: res.token, user: normalizeUser(res.user) }
}

export async function createRequestRemote(input: {
  title: string
  description: string
  category: string
  urgency: UrgencyLevel
  tags: string[]
}): Promise<HelpRequest> {
  const res = await apiFetch<{ request: Record<string, unknown> }>('/api/requests/create', {
    method: 'POST',
    body: JSON.stringify({
      title: input.title,
      description: input.description,
      category: input.category,
      urgency: input.urgency,
      tags: input.tags,
    }),
  })
  return normalizeRequest(res.request)
}

export async function helpRequestRemote(requestId: string): Promise<{
  request: HelpRequest
  user: Partial<User> & { id: string }
}> {
  const res = await apiFetch<{
    request: Record<string, unknown>
    user: Record<string, unknown>
  }>('/api/requests/help', {
    method: 'POST',
    body: JSON.stringify({ requestId }),
  })
  return {
    request: normalizeRequest(res.request),
    user: {
      id: String(res.user.id),
      trustScore: Number(res.user.trustScore),
      helpedCount: Number(res.user.helpedCount),
      contributions: Number(res.user.contributions),
      badges: res.user.badges as string[],
    },
  }
}

export async function solveRequestRemote(requestId: string): Promise<{
  request: HelpRequest
  user: Partial<User> & { id: string }
}> {
  const res = await apiFetch<{
    request: Record<string, unknown>
    user: Record<string, unknown>
  }>('/api/requests/solve', {
    method: 'POST',
    body: JSON.stringify({ requestId }),
  })
  return {
    request: normalizeRequest(res.request),
    user: {
      id: String(res.user.id),
      trustScore: Number(res.user.trustScore),
      solvedCount: Number(res.user.solvedCount),
      contributions: Number(res.user.contributions),
      badges: res.user.badges as string[],
    },
  }
}

export async function sendMessageRemote(requestId: string, body: string): Promise<HelpRequest['messages'][0]> {
  const res = await apiFetch<{ message: Record<string, unknown> }>('/api/messages/send', {
    method: 'POST',
    body: JSON.stringify({ requestId, message: body }),
  })
  const m = res.message
  return {
    id: String(m.id),
    requestId: String(m.requestId),
    authorId: String(m.authorId),
    authorName: String(m.authorName ?? ''),
    body: String(m.body ?? ''),
    createdAt: String(m.createdAt ?? new Date().toISOString()),
  }
}

export async function getNotificationsRemote(
  userId: string
): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  const res = await apiFetch<{
    notifications: Record<string, unknown>[]
    unreadCount: number
  }>(`/api/notifications/${userId}`)
  return {
    notifications: (res.notifications || []).map((n) => normalizeNotification(n)),
    unreadCount: Number(res.unreadCount || 0),
  }
}

export async function createNotificationRemote(input: {
  userId: string
  type: NotificationItem['type']
  title: string
  message: string
  requestId?: string | null
  category?: string | null
}): Promise<NotificationItem> {
  const res = await apiFetch<{ notification: Record<string, unknown> }>(
    '/api/notifications/create',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  )
  return normalizeNotification(res.notification)
}

export async function markNotificationsReadRemote(input: {
  userId: string
  notificationId?: string
  readAll?: boolean
}): Promise<{ unreadCount: number }> {
  const res = await apiFetch<{ unreadCount: number }>('/api/notifications/read', {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  return { unreadCount: Number(res.unreadCount || 0) }
}

export async function getAnalyticsOverviewRemote(): Promise<AnalyticsOverview> {
  return apiFetch<AnalyticsOverview>('/api/analytics/overview')
}

/** Public read — no auth required on server; omit JWT to match backend. */
export async function getMessagesForRequestRemote(requestId: string): Promise<Message[]> {
  const res = await apiFetch<{ messages: Record<string, unknown>[] }>(
    `/api/messages/${requestId}`,
    {},
    false
  )
  return (res.messages || []).map((m) => normalizeMessage(m))
}

/**
 * Server rule-based AI (POST /api/ai/analyze). Returns null on failure — use local ai-rules fallback.
 */
export async function analyzeRequestRemote(text: string): Promise<AiAnalysisResult | null> {
  if (!isApiConfigured()) return null
  try {
    const res = await apiFetch<{ category: string; urgency: string; tags: string[] }>(
      '/api/ai/analyze',
      {
        method: 'POST',
        body: JSON.stringify({ text }),
      },
      false
    )
    const u = res.urgency
    const urgency: AiAnalysisResult['urgency'] =
      u === 'High' || u === 'Low' || u === 'Medium' ? u : 'Medium'
    return {
      category: String(res.category ?? 'Other'),
      urgency,
      tags: Array.isArray(res.tags) ? res.tags : [],
    }
  } catch {
    return null
  }
}
