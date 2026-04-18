'use client'

import { io, type Socket } from 'socket.io-client'
import { getJwt } from './api-client'
import type { Message } from './types'

let socketInstance: Socket | null = null

function socketBaseUrl(): string {
  const b = process.env.NEXT_PUBLIC_API_URL || ''
  return b.replace(/\/$/, '')
}

export function getSocket(): Socket | null {
  if (typeof window === 'undefined') return null
  const base = socketBaseUrl()
  const token = getJwt()
  if (!base || !token) return null

  if (!socketInstance) {
    socketInstance = io(base, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: { token },
    })
  } else if ((socketInstance.auth as { token?: string } | undefined)?.token !== token) {
    socketInstance.auth = { token }
    socketInstance.connect()
  }

  return socketInstance
}

export function joinRequestRoom(requestId: string): void {
  const s = getSocket()
  if (!s || !s.connected) return
  s.emit('join-room', { requestId })
}

export function onReceiveMessage(cb: (message: Message) => void): () => void {
  const s = getSocket()
  if (!s) return () => {}
  const handler = (msg: Message) => cb(msg)
  s.on('receive-message', handler)
  return () => s.off('receive-message', handler)
}

export function sendMessageRealtime(
  requestId: string,
  message: string
): Promise<{ ok: boolean; message?: Message; error?: string }> {
  const s = getSocket()
  if (!s || !s.connected) {
    return Promise.resolve({ ok: false, error: 'socket_unavailable' })
  }
  return new Promise((resolve) => {
    s.emit('send-message', { requestId, message }, (ack: { ok: boolean; message?: Message; error?: string }) => {
      resolve(ack || { ok: false, error: 'send_failed' })
    })
  })
}

