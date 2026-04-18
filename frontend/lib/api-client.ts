/**
 * Single HTTP layer for the Helplytics backend.
 * Uses NEXT_PUBLIC_API_URL; JWT in localStorage (helphub_jwt) for protected routes.
 */

export const JWT_KEY = 'helphub_jwt'

export function getApiBaseUrl(): string {
  const b = process.env.NEXT_PUBLIC_API_URL || ''
  return b.replace(/\/$/, '')
}

export function isApiConfigured(): boolean {
  return typeof window !== 'undefined' && !!getApiBaseUrl()
}

export function getJwt(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(JWT_KEY)
}

export function setJwt(token: string | null): void {
  if (typeof window === 'undefined') return
  if (token) localStorage.setItem(JWT_KEY, token)
  else localStorage.removeItem(JWT_KEY)
}

export class ApiRequestError extends Error {
  readonly status: number
  readonly body: string

  constructor(message: string, status: number, body: string) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.body = body
  }
}

/**
 * Low-level JSON fetch. Throws ApiRequestError on non-2xx.
 * Uses CORS + JWT header (no cookies). Offline callers should catch and fall back.
 */
export async function apiFetch<T>(path: string, init: RequestInit = {}, withAuth = true): Promise<T> {
  const base = getApiBaseUrl()
  const p = path.startsWith('/') ? path : `/${path}`
  const url = `${base}${p}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  }
  if (withAuth) {
    const j = getJwt()
    if (j) headers.Authorization = `Bearer ${j}`
  }

  const res = await fetch(url, {
    ...init,
    headers,
    mode: 'cors',
    credentials: 'omit',
  })

  const text = await res.text()
  if (!res.ok) {
    let msg = res.statusText || 'Request failed'
    if (text) {
      try {
        const j = JSON.parse(text) as { error?: string; message?: string }
        if (typeof j.error === 'string') msg = j.error
        else if (typeof j.message === 'string') msg = j.message
      } catch {
        if (text.length < 500) msg = text
      }
    }
    throw new ApiRequestError(msg, res.status, text)
  }
  if (!text) return {} as T
  return JSON.parse(text) as T
}
