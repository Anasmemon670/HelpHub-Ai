export type UrgencyLevel = 'Low' | 'Medium' | 'High'

export type RequestStatus = 'Open' | 'In Progress' | 'Solved'

export interface Message {
  id: string
  requestId: string
  authorId: string
  authorName: string
  body: string
  createdAt: string
}

export interface User {
  id: string
  name: string
  email: string
  role: string
  skills: string[]
  trustScore: number
  contributions: number
  helpedCount: number
  solvedCount: number
  badges: string[]
  location: string
  lastActiveAt: string
  isAdmin?: boolean
}

export interface HelpRequest {
  id: string
  title: string
  description: string
  category: string
  urgency: UrgencyLevel
  status: RequestStatus
  tags: string[]
  authorId: string
  authorName: string
  location: string
  helperIds: string[]
  messages: Message[]
  createdAt: string
  reviewed?: boolean
}

export interface AppData {
  users: Record<string, User>
  requests: HelpRequest[]
}

export interface NotificationItem {
  id: string
  userId: string
  type: 'new_request_in_category' | 'request_helped' | 'request_solved' | 'system'
  title: string
  message: string
  requestId: string | null
  category: string | null
  read: boolean
  createdAt: string
}

export interface AnalyticsCategoryCount {
  category: string
  count: number
}

export interface AnalyticsUserActivity {
  userId: string
  name: string
  requestsCreated: number
  helpSessions: number
  activityScore: number
}

export interface AnalyticsOverview {
  totalRequests: number
  byStatus: { open: number; in_progress: number; solved: number }
  successRate: number
  topCategories: AnalyticsCategoryCount[]
  mostActiveUsers: AnalyticsUserActivity[]
}
