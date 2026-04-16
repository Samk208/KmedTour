/**
 * KmedTour — Chat History Hook
 * File: hooks/useChatHistory.ts  (create this file in the repo)
 *
 * INSTRUCTIONS FOR SAM:
 * 1. Create this file at: hooks/useChatHistory.ts
 * 2. Import and use it in your chat widget (see usage example below)
 * 3. The hook loads history on mount for authenticated users
 * 4. Gracefully handles unauthenticated users (returns empty history)
 *
 * USAGE in your chat widget component:
 *
 *   import { useChatHistory } from '@/hooks/useChatHistory'
 *
 *   export function ChatWidget() {
 *     const sessionId = useMemo(() => crypto.randomUUID(), []) // stable per mount
 *     const { history, isLoading } = useChatHistory(sessionId)
 *
 *     // Initialize messages state with loaded history
 *     const [messages, setMessages] = useState<Message[]>([])
 *
 *     useEffect(() => {
 *       if (history.length > 0 && messages.length === 0) {
 *         setMessages(history.map(h => ({
 *           id: crypto.randomUUID(),
 *           role: h.role,
 *           content: h.content,
 *         })))
 *       }
 *     }, [history])
 *
 *     // ... rest of component
 *   }
 */

'use client'

import { useState, useEffect } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

interface UseChatHistoryResult {
  history: HistoryMessage[]
  isLoading: boolean
  error: string | null
  clearHistory: () => Promise<void>
}

// ─── Session ID persistence ───────────────────────────────────────────────────
// We persist the session ID in memory (not localStorage) for this session.
// On page refresh, a new session ID is generated — history loads from DB.

let cachedSessionId: string | null = null

function getOrCreateSessionId(): string {
  if (!cachedSessionId) {
    // Generate a new session ID for this page load
    cachedSessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
  }
  return cachedSessionId
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useChatHistory(sessionId?: string): UseChatHistoryResult {
  const resolvedSessionId = sessionId ?? getOrCreateSessionId()
  const [history, setHistory] = useState<HistoryMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadHistory() {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch(
          `/api/rag/chat?sessionId=${encodeURIComponent(resolvedSessionId)}`,
          { method: 'GET' },
        )

        if (!res.ok) {
          // Not authenticated or other error — silently return empty history
          setHistory([])
          return
        }

        const data = await res.json()

        if (!cancelled) {
          setHistory(data.history ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          // Non-critical: chat works without history
          console.warn('[useChatHistory] Failed to load history:', err)
          setHistory([])
          setError('Could not load chat history')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadHistory()

    return () => {
      cancelled = true
    }
  }, [resolvedSessionId])

  const clearHistory = async () => {
    try {
      // Optimistically clear UI
      setHistory([])
      // Note: Add a DELETE endpoint to /api/rag/chat if you want server-side clearing
      // For now, clearing just clears the local state
    } catch (err) {
      console.error('[useChatHistory] Failed to clear history:', err)
    }
  }

  return { history, isLoading, error, clearHistory }
}

// ─── Utility: Get session ID for sending with chat messages ───────────────────
// Use this in your chat widget's send function to include sessionId in requests

export function getSessionId(): string {
  return getOrCreateSessionId()
}
