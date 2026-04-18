'use client'

import { useEffect } from 'react'
import { applyInactivityPenaltyIfNeeded, getCurrentUserId, syncFromServer } from '@/lib/app-store'

export function StateBootstrap() {
  useEffect(() => {
    void (async () => {
      await syncFromServer()
      const id = getCurrentUserId()
      if (id) applyInactivityPenaltyIfNeeded(id)
    })()
  }, [])
  return null
}
