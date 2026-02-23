'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, MessageCircle, Send, X } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

const TreatmentAdvisorMarkdown = dynamic(
  () => import('@/components/treatment-advisor-markdown').then((m) => ({ default: m.TreatmentAdvisorMarkdown })),
  { ssr: false, loading: () => <span className="animate-pulse">...</span> }
)

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: { ref: string; title: string; source_url: string | null }[]
  isError?: boolean
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I'm your KmedTour assistant. I can help with procedure costs, clinic recommendations, and travel to Korea for medical care. How can I assist you?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current && open) {
      const viewport = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (viewport) viewport.scrollTop = viewport.scrollHeight
    }
  }, [messages, open])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    const userMsg: Message = { id: `user-${Date.now()}`, role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })

      const data = await res.json()

      if (data.success) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: data.answer,
            citations: data.citations,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content:
              "I'm having trouble connecting right now. Please try again or [contact a coordinator](/contact) directly.",
            isError: true,
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content:
            "Connection error. Please check your network or [contact us](/contact) for help.",
          isError: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating button */}
      <Button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open AI assistant'}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-900/30 border-0"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[min(400px,calc(100vw-3rem))] rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden flex flex-col"
          style={{ height: 'min(500px, 70vh)' }}
        >
          <div className="flex items-center gap-2 px-4 py-3 bg-teal-600 text-white shrink-0">
            <Bot className="h-5 w-5" />
            <span className="font-semibold text-sm">KmedTour Assistant</span>
            <Link
              href="/treatment-advisor"
              className="ml-auto text-xs text-teal-100 hover:text-white underline"
            >
              Full chat
            </Link>
          </div>

          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="flex flex-col gap-4 pb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2 max-w-[90%]',
                    msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                  )}
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      msg.role === 'user'
                        ? 'bg-teal-100 text-teal-700'
                        : 'bg-teal-50 text-teal-600'
                    )}
                  >
                    {msg.role === 'user' ? (
                      <span className="text-xs font-bold">You</span>
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      'px-3 py-2 rounded-xl text-sm',
                      msg.role === 'user'
                        ? 'bg-teal-600 text-white rounded-tr-sm'
                        : cn(
                            'bg-gray-50 text-gray-800 border border-gray-100',
                            msg.isError && 'border-red-200 bg-red-50 text-red-800'
                          )
                    )}
                  >
                    {msg.isError ? (
                      <p>{msg.content}</p>
                    ) : (
                      <TreatmentAdvisorMarkdown
                        content={msg.content}
                        citations={msg.citations}
                        theme="light"
                      />
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2 self-start">
                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-teal-500 animate-pulse" />
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-3 border-t border-gray-100 bg-gray-50/50 shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about procedures, costs..."
                className="flex-1 text-sm"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                size="sm"
                className="bg-teal-600 hover:bg-teal-500 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              For emergencies call 119. Not medical advice — consult a healthcare professional.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
