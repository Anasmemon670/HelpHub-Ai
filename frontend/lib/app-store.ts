'use client'

import { useSyncExternalStore } from 'react'
import type { AppData, HelpRequest, Message, NotificationItem, User, UrgencyLevel } from './types'
import {
  authLogin,
  authRegister,
  createNotificationRemote,
  createRequestRemote,
  getApiPassword,
  getJwt,
  getNotificationsRemote,
  helpRequestRemote,
  isApiConfigured,
  markNotificationsReadRemote,
  pullRemoteState,
  sendMessageRemote,
  setJwt,
  solveRequestRemote,
  storeApiPassword,
} from './remote-client'

const STORAGE_KEY = 'helphub_app_data_v1'
const CURRENT_USER_KEY = 'helphub_current_user_id'
const NOTIFICATIONS_KEY = 'helphub_notifications_v1'

export const TRUST_HELP = 10
export const TRUST_SOLVE = 20
export const TRUST_INACTIVITY = -5
const INACTIVITY_DAYS = 7

function nowIso(): string {
  return new Date().toISOString()
}

function daysBetween(a: string, b: string): number {
  return Math.floor((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24))
}

function createMessage(
  requestId: string,
  authorId: string,
  authorName: string,
  body: string
): Message {
  return {
    id: `msg-${requestId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    requestId,
    authorId,
    authorName,
    body,
    createdAt: nowIso(),
  }
}

function seedData(): AppData {
  const users: Record<string, User> = {
    'u-ayesha': {
      id: 'u-ayesha',
      name: 'Ayesha Khan',
      email: 'ayesha@example.com',
      role: 'Mentor',
      skills: ['Figma', 'Design', 'UI/UX'],
      trustScore: 92,
      contributions: 18,
      helpedCount: 12,
      solvedCount: 18,
      badges: ['Top Helper', 'Design Expert', 'Quick Responder'],
      location: 'Lahore',
      lastActiveAt: nowIso(),
    },
    'u-ahmed': {
      id: 'u-ahmed',
      name: 'Ahmed Malik',
      email: 'ahmed@example.com',
      role: 'Professional',
      skills: ['Node.js', 'Backend', 'API'],
      trustScore: 88,
      contributions: 15,
      helpedCount: 10,
      solvedCount: 15,
      badges: ['Backend Pro', 'Mentor'],
      location: 'Islamabad',
      lastActiveAt: nowIso(),
    },
    'u-sara': {
      id: 'u-sara',
      name: 'Sara Noor',
      email: 'sara@example.com',
      role: 'Student',
      skills: ['HTML/CSS', 'Frontend', 'Career'],
      trustScore: 85,
      contributions: 12,
      helpedCount: 8,
      solvedCount: 12,
      badges: ['Rising Star', 'Frontend'],
      location: 'Karachi',
      lastActiveAt: nowIso(),
    },
    'u-zain': {
      id: 'u-zain',
      name: 'Zain Abbas',
      email: 'zain@example.com',
      role: 'Creator',
      skills: ['UI/UX', 'E-commerce'],
      trustScore: 82,
      contributions: 10,
      helpedCount: 6,
      solvedCount: 10,
      badges: ['UI/UX', 'Helpful'],
      location: 'Lahore',
      lastActiveAt: nowIso(),
    },
    'u-fatima': {
      id: 'u-fatima',
      name: 'Fatima Ali',
      email: 'fatima@example.com',
      role: 'Student',
      skills: ['React Native', 'Mobile'],
      trustScore: 78,
      contributions: 8,
      helpedCount: 5,
      solvedCount: 8,
      badges: ['Mobile Dev'],
      location: 'Karachi',
      lastActiveAt: nowIso(),
    },
    'u-hassan': {
      id: 'u-hassan',
      name: 'Hassan Sheikh',
      email: 'hassan@example.com',
      role: 'Student',
      skills: ['General'],
      trustScore: 75,
      contributions: 7,
      helpedCount: 4,
      solvedCount: 7,
      badges: ['Newcomer'],
      location: 'Peshawar',
      lastActiveAt: nowIso(),
    },
  }

  const requests: HelpRequest[] = [
    {
      id: '1',
      title: 'Need help making my portfolio responsive before demo day',
      description:
        'My HTML/CSS portfolio breaks on tablets and I need layout guidance before tomorrow evening.',
      category: 'Web Development',
      urgency: 'High',
      status: 'Open',
      tags: ['HTML/CSS', 'Responsive', 'Portfolio'],
      authorId: 'u-sara',
      authorName: 'Sara Noor',
      location: 'Karachi',
      helperIds: [],
      messages: [],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: '2',
      title: 'Looking for Figma feedback on a volunteer event poster',
      description:
        'I have a draft poster for a campus community event and want sharper hierarchy, spacing, and CTA copy.',
      category: 'Design',
      urgency: 'Medium',
      status: 'Open',
      tags: ['Figma', 'Poster', 'Design Review'],
      authorId: 'u-ayesha',
      authorName: 'Ayesha Khan',
      location: 'Lahore',
      helperIds: [],
      messages: [],
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: '3',
      title: 'Need mock interview support for internship applications',
      description:
        'Applying to frontend internships and need someone to practice behavioral and technical interview questions with me.',
      category: 'Career',
      urgency: 'Low',
      status: 'Solved',
      tags: ['Interview Prep', 'Career', 'Frontend'],
      authorId: 'u-sara',
      authorName: 'Sara Noor',
      location: 'Remote',
      helperIds: ['u-ayesha'],
      messages: [],
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: '4',
      title: 'Help needed with Node.js API authentication',
      description: 'Building a REST API and struggling with JWT implementation and middleware setup.',
      category: 'Backend',
      urgency: 'High',
      status: 'Open',
      tags: ['Node.js', 'JWT', 'API'],
      authorId: 'u-ahmed',
      authorName: 'Ahmed Malik',
      location: 'Islamabad',
      helperIds: [],
      messages: [],
      createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: '5',
      title: 'React Native navigation issues on Android',
      description: 'Stack navigator not working correctly when deep linking from notifications.',
      category: 'Mobile',
      urgency: 'Medium',
      status: 'Open',
      tags: ['React Native', 'Navigation', 'Android'],
      authorId: 'u-fatima',
      authorName: 'Fatima Ali',
      location: 'Karachi',
      helperIds: [],
      messages: [],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
    {
      id: '6',
      title: 'UI review for e-commerce checkout flow',
      description: 'Need someone experienced to review my checkout design for usability issues.',
      category: 'Design',
      urgency: 'Low',
      status: 'Open',
      tags: ['UI/UX', 'E-commerce', 'Review'],
      authorId: 'u-zain',
      authorName: 'Zain Abbas',
      location: 'Lahore',
      helperIds: [],
      messages: [],
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ]

  return { users, requests }
}

let memory: AppData | null = null
let storageListenerAttached = false

function attachStorageSync(): void {
  if (typeof window === 'undefined' || storageListenerAttached) return
  storageListenerAttached = true
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      memory = null
    }
    if (e.key === STORAGE_KEY || e.key === CURRENT_USER_KEY) {
      emit()
    }
  })
}

function load(): AppData {
  if (typeof window === 'undefined') return seedData()
  attachStorageSync()
  if (memory) return memory
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      if (parsed && parsed.requests && parsed.users) {
        memory = parsed
        return memory
      }
    }
  } catch {
    /* fall through */
  }
  memory = seedData()
  persist()
  return memory
}

function persist(): void {
  if (typeof window === 'undefined' || !memory) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory))
  } catch {
    /* ignore */
  }
}

function loadLocalNotifications(): NotificationItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as NotificationItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistLocalNotifications(list: NotificationItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

function pushLocalNotification(input: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>): void {
  const list = loadLocalNotifications()
  list.unshift({
    ...input,
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: nowIso(),
    read: false,
  })
  persistLocalNotifications(list.slice(0, 200))
}

const listeners = new Set<() => void>()
let dataVersion = 0

function emit(): void {
  dataVersion += 1
  listeners.forEach((fn) => fn())
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('helphub-state-change'))
  }
}

function getVersionSnapshot(): number {
  load()
  return dataVersion
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): AppData {
  return load()
}

export function getServerSnapshot(): AppData {
  return seedData()
}

function touchUser(userId: string): void {
  const data = load()
  const u = data.users[userId]
  if (u) {
    u.lastActiveAt = nowIso()
  }
}

export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(CURRENT_USER_KEY)
}

export function setCurrentUserId(userId: string | null): void {
  if (typeof window === 'undefined') return
  if (userId) {
    localStorage.setItem(CURRENT_USER_KEY, userId)
    touchUser(userId)
  } else {
    localStorage.removeItem(CURRENT_USER_KEY)
    if (isApiConfigured()) setJwt(null)
  }
  emit()
}

function looksLikeMongoId(id: string): boolean {
  return /^[a-f\d]{24}$/i.test(id)
}

export function replaceAppData(next: AppData): void {
  memory = {
    users: { ...next.users },
    requests: next.requests.map((r) => ({
      ...r,
      tags: [...r.tags],
      helperIds: [...r.helperIds],
      messages: r.messages.map((m) => ({ ...m })),
    })),
  }
  persist()
  emit()
}

function mergeAppData(current: AppData, incoming: AppData): AppData {
  const users =
    Object.keys(incoming.users).length > 0
      ? { ...current.users, ...incoming.users }
      : { ...current.users }

  const requests =
    incoming.requests.length > 0
      ? incoming.requests.map((r) => ({
          ...r,
          tags: [...r.tags],
          helperIds: [...r.helperIds],
          messages: r.messages.map((m) => ({ ...m })),
        }))
      : current.requests.map((r) => ({
          ...r,
          tags: [...r.tags],
          helperIds: [...r.helperIds],
          messages: r.messages.map((m) => ({ ...m })),
        }))

  return { users, requests }
}

export async function syncFromServer(): Promise<boolean> {
  if (!isApiConfigured()) return false
  try {
    const data = await pullRemoteState()
    if (
      data &&
      (data.requests.length > 0 || Object.keys(data.users).length > 0)
    ) {
      const merged = mergeAppData(load(), data)
      replaceAppData(merged)
      return true
    }
  } catch (e) {
    console.warn('[Helplytics] syncFromServer failed', e)
  }
  return false
}

function registerUserLocal(input: {
  name: string
  email: string
  role: string
  skills: string
}): User {
  const data = load()
  const id = `u-${Date.now()}`
  const skills = input.skills
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const user: User = {
    id,
    name: input.name,
    email: input.email.toLowerCase(),
    role: input.role,
    skills: skills.length ? skills : ['Community'],
    trustScore: 70,
    contributions: 0,
    helpedCount: 0,
    solvedCount: 0,
    badges: ['Member'],
    location: 'Remote',
    lastActiveAt: nowIso(),
  }
  data.users[id] = user
  persist()
  emit()
  return user
}

export async function registerUser(input: {
  name: string
  email: string
  role: string
  skills: string
}): Promise<User> {
  if (isApiConfigured()) {
    try {
      const password = crypto.randomUUID()
      const { token, user } = await authRegister({
        name: input.name,
        email: input.email,
        password,
        role: input.role,
        skills: input.skills,
      })
      storeApiPassword(input.email, password)
      setJwt(token)
      const pulled = await pullRemoteState()
      if (pulled) {
        replaceAppData(pulled)
      } else {
        const data = load()
        data.users[user.id] = user
        persist()
        emit()
      }
      return user
    } catch (e) {
      console.warn('[Helplytics] API register unavailable, using offline store', e)
    }
  }
  return registerUserLocal(input)
}

export async function loginByEmail(email: string): Promise<User | null> {
  const e = email.toLowerCase().trim()
  if (isApiConfigured()) {
    const pw = getApiPassword(e)
    if (pw) {
      try {
        const { token, user } = await authLogin(e, pw)
        setJwt(token)
        const pulled = await pullRemoteState()
        if (pulled) replaceAppData(pulled)
        setCurrentUserId(user.id)
        return user
      } catch (err) {
        console.warn('[Helplytics] API login failed, trying offline store', err)
      }
    }
  }
  const data = load()
  const found = Object.values(data.users).find((u) => u.email === e)
  if (!found) return null
  setCurrentUserId(found.id)
  return found
}

export function applyInactivityPenaltyIfNeeded(userId: string): void {
  const data = load()
  const u = data.users[userId]
  if (!u) return
  const d = daysBetween(u.lastActiveAt, nowIso())
  if (d >= INACTIVITY_DAYS) {
    u.trustScore = Math.max(0, u.trustScore + TRUST_INACTIVITY)
    u.lastActiveAt = nowIso()
    persist()
    emit()
  }
}

function addRequestLocal(input: {
  title: string
  description: string
  category: string
  urgency: UrgencyLevel
  tags: string[]
  authorId: string
  authorName: string
  location: string
}): HelpRequest {
  const data = load()
  const maxId = data.requests.reduce((m, r) => {
    const n = parseInt(r.id, 10)
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)
  const id = String(maxId + 1)
  const req: HelpRequest = {
    id,
    title: input.title,
    description: input.description,
    category: input.category,
    urgency: input.urgency,
    status: 'Open',
    tags: input.tags,
    authorId: input.authorId,
    authorName: input.authorName,
    location: input.location,
    helperIds: [],
    messages: [],
    createdAt: nowIso(),
  }
  data.requests.unshift(req)
  const author = data.users[input.authorId]
  if (author) {
    author.contributions += 1
    touchUser(input.authorId)
  }
  const categoryNeedle = input.category.toLowerCase()
  Object.values(data.users)
    .filter((u) => u.id !== input.authorId)
    .forEach((u) => {
      const matches = u.skills.some((s) => s.toLowerCase().includes(categoryNeedle))
      if (matches) {
        pushLocalNotification({
          userId: u.id,
          type: 'new_request_in_category',
          title: 'New request in your category',
          message: `${input.authorName} posted a new ${input.category} request.`,
          requestId: req.id,
          category: input.category,
        })
      }
    })
  persist()
  emit()
  return req
}

export async function addRequest(input: {
  title: string
  description: string
  category: string
  urgency: UrgencyLevel
  tags: string[]
  authorId: string
  authorName: string
  location: string
}): Promise<HelpRequest> {
  if (isApiConfigured() && getJwt()) {
    try {
      const r = await createRequestRemote({
        title: input.title,
        description: input.description,
        category: input.category,
        urgency: input.urgency,
        tags: input.tags,
      })
      const data = load()
      const idx = data.requests.findIndex((x) => x.id === r.id)
      if (idx >= 0) data.requests[idx] = r
      else data.requests.unshift(r)
      const author = data.users[input.authorId]
      if (author) {
        author.contributions += 1
        touchUser(input.authorId)
      }
      persist()
      emit()
      return r
    } catch (e) {
      console.warn('[Helplytics] API create request failed, using offline store', e)
    }
  }
  return addRequestLocal(input)
}

export function getRequestById(id: string): HelpRequest | undefined {
  return load().requests.find((r) => r.id === id)
}

function markCanHelpLocal(requestId: string, helperId: string): boolean {
  const data = load()
  const req = data.requests.find((r) => r.id === requestId)
  const helper = data.users[helperId]
  if (!req || !helper) return false
  if (req.authorId === helperId) return false
  if (req.helperIds.includes(helperId)) return false
  req.helperIds.push(helperId)
  helper.trustScore += TRUST_HELP
  helper.helpedCount += 1
  helper.contributions += 1
  if (helper.trustScore >= 80 && !helper.badges.includes('Trusted Helper')) {
    helper.badges.push('Trusted Helper')
  }
  touchUser(helperId)
  req.status = req.status === 'Open' ? 'In Progress' : req.status
  const sys = createMessage(
    requestId,
    helperId,
    helper.name,
    `${helper.name} offered to help on this request.`
  )
  req.messages.push(sys)
  pushLocalNotification({
    userId: req.authorId,
    type: 'request_helped',
    title: 'Someone can help',
    message: `${helper.name} offered to help with your request.`,
    requestId,
    category: req.category,
  })
  persist()
  emit()
  return true
}

export async function markCanHelp(requestId: string, helperId: string): Promise<boolean> {
  if (isApiConfigured() && getJwt() && looksLikeMongoId(requestId)) {
    try {
      const { request, user: patch } = await helpRequestRemote(requestId)
      const data = load()
      const idx = data.requests.findIndex((r) => r.id === requestId)
      if (idx >= 0) data.requests[idx] = request
      const helper = data.users[patch.id]
      if (helper) {
        helper.trustScore = patch.trustScore ?? helper.trustScore
        if (patch.helpedCount != null) helper.helpedCount = patch.helpedCount
        if (patch.contributions != null) helper.contributions = patch.contributions
        if (patch.badges) helper.badges = patch.badges
      }
      persist()
      emit()
      return true
    } catch (e) {
      console.warn('[Helplytics] API help failed, using offline store', e)
    }
  }
  return markCanHelpLocal(requestId, helperId)
}

function markSolvedLocal(requestId: string, actorId: string): boolean {
  const data = load()
  const req = data.requests.find((r) => r.id === requestId)
  const actor = data.users[actorId]
  if (!req || !actor) return false
  const canMark =
    req.authorId === actorId || req.helperIds.includes(actorId)
  if (!canMark) return false
  if (req.status === 'Solved') return false
  req.status = 'Solved'
  actor.trustScore += TRUST_SOLVE
  actor.solvedCount += 1
  actor.contributions += 1
  if (!actor.badges.includes('Problem Solver')) {
    actor.badges.push('Problem Solver')
  }
  touchUser(actorId)
  req.messages.push(
    createMessage(requestId, actorId, actor.name, 'This request was marked as solved.')
  )
  const notifyIds = new Set<string>([req.authorId, ...req.helperIds])
  notifyIds.delete(actorId)
  notifyIds.forEach((uid) => {
    pushLocalNotification({
      userId: uid,
      type: 'request_solved',
      title: 'Request marked solved',
      message: `${actor.name} marked a request as solved.`,
      requestId,
      category: req.category,
    })
  })
  persist()
  emit()
  return true
}

export async function markSolved(requestId: string, actorId: string): Promise<boolean> {
  if (isApiConfigured() && getJwt() && looksLikeMongoId(requestId)) {
    try {
      const { request, user: patch } = await solveRequestRemote(requestId)
      const data = load()
      const idx = data.requests.findIndex((r) => r.id === requestId)
      if (idx >= 0) data.requests[idx] = request
      const actor = data.users[patch.id]
      if (actor) {
        actor.trustScore = patch.trustScore ?? actor.trustScore
        if (patch.solvedCount != null) actor.solvedCount = patch.solvedCount
        if (patch.contributions != null) actor.contributions = patch.contributions
        if (patch.badges) actor.badges = patch.badges
      }
      persist()
      emit()
      return true
    } catch (e) {
      console.warn('[Helplytics] API solve failed, using offline store', e)
    }
  }
  return markSolvedLocal(requestId, actorId)
}

function addChatMessageLocal(requestId: string, authorId: string, body: string): void {
  const data = load()
  const req = data.requests.find((r) => r.id === requestId)
  const author = data.users[authorId]
  if (!req || !author || !body.trim()) return
  req.messages.push(createMessage(requestId, authorId, author.name, body.trim()))
  touchUser(authorId)
  persist()
  emit()
}

export async function addChatMessage(
  requestId: string,
  authorId: string,
  body: string
): Promise<void> {
  if (isApiConfigured() && getJwt() && looksLikeMongoId(requestId)) {
    try {
      const msg = await sendMessageRemote(requestId, body)
      const data = load()
      const req = data.requests.find((r) => r.id === requestId)
      if (req) {
        req.messages.push(msg)
        touchUser(authorId)
        persist()
        emit()
      }
      return
    } catch (e) {
      console.warn('[Helplytics] API message failed, using offline store', e)
    }
  }
  addChatMessageLocal(requestId, authorId, body)
}

export function ingestIncomingMessage(requestId: string, message: Message): void {
  const data = load()
  const req = data.requests.find((r) => r.id === requestId)
  if (!req) return
  const exists = req.messages.some((m) => m.id === message.id)
  if (exists) return
  req.messages.push(message)
  persist()
  emit()
}

export function getStats() {
  const data = load()
  const total = data.requests.length
  const solved = data.requests.filter((r) => r.status === 'Solved').length
  const active = data.requests.filter((r) => r.status !== 'Solved').length
  return { total, solved, active }
}

export function sortRequestsForFeed(list: HelpRequest[]): HelpRequest[] {
  const order: Record<UrgencyLevel, number> = { High: 3, Medium: 2, Low: 1 }
  return [...list].sort((a, b) => {
    const u = order[b.urgency] - order[a.urgency]
    if (u !== 0) return u
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

export function useAppData(): AppData {
  useSyncExternalStore(subscribe, getVersionSnapshot, () => 0)
  return load()
}

function getSessionSnapshot(): string {
  if (typeof window === 'undefined') return ''
  return getCurrentUserId() ?? ''
}

export function useSessionUserId(): string | null {
  const s = useSyncExternalStore(subscribe, getSessionSnapshot, () => '')
  return s || null
}

export function useCurrentUser(): User | null {
  const data = useAppData()
  const sessionId = useSessionUserId()
  return sessionId && data.users[sessionId] ? data.users[sessionId] : null
}

export async function getNotificationsForUser(
  userId: string
): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
  if (isApiConfigured() && getJwt() && looksLikeMongoId(userId)) {
    try {
      return await getNotificationsRemote(userId)
    } catch (e) {
      console.warn('[Helplytics] API notifications fetch failed, using offline store', e)
    }
  }
  const list = loadLocalNotifications()
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const unreadCount = list.reduce((acc, n) => acc + (n.read ? 0 : 1), 0)
  return { notifications: list, unreadCount }
}

export async function markNotificationsRead(input: {
  userId: string
  notificationId?: string
  readAll?: boolean
}): Promise<{ unreadCount: number }> {
  if (isApiConfigured() && getJwt() && looksLikeMongoId(input.userId)) {
    try {
      return await markNotificationsReadRemote(input)
    } catch (e) {
      console.warn('[Helplytics] API notifications read failed, using offline store', e)
    }
  }
  const list = loadLocalNotifications()
  const next = list.map((n) => {
    if (n.userId !== input.userId) return n
    if (input.readAll) return { ...n, read: true }
    if (input.notificationId && n.id === input.notificationId) return { ...n, read: true }
    return n
  })
  persistLocalNotifications(next)
  emit()
  const unreadCount = next.reduce(
    (acc, n) => acc + (n.userId === input.userId && !n.read ? 1 : 0),
    0
  )
  return { unreadCount }
}

export async function createNotification(input: {
  userId: string
  type: NotificationItem['type']
  title: string
  message: string
  requestId?: string | null
  category?: string | null
}): Promise<void> {
  if (isApiConfigured() && getJwt() && looksLikeMongoId(input.userId)) {
    try {
      await createNotificationRemote(input)
      emit()
      return
    } catch (e) {
      console.warn('[Helplytics] API notification create failed, using offline store', e)
    }
  }
  pushLocalNotification({
    userId: input.userId,
    type: input.type,
    title: input.title,
    message: input.message,
    requestId: input.requestId || null,
    category: input.category || null,
  })
  emit()
}
