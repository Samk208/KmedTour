'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { AlertCircle, Bot, Send, Sparkles, User } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import React, { useEffect, useRef, useState } from 'react'

const TreatmentAdvisorMarkdown = dynamic(
  () => import('@/components/treatment-advisor-markdown').then(m => ({ default: m.TreatmentAdvisorMarkdown })),
  { ssr: true, loading: () => <span className="animate-pulse">...</span> }
)

type Message = {
  role: 'user' | 'assistant'
  content: string
  citations?: { ref: string; title: string; source_url: string | null }[]
  isError?: boolean
}

export default function TreatmentAdvisorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your AI Medical Advisor. I can check procedure costs, recommend verified hospitals, and explain medical itineraries. How can I assist you?"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const res = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      })

      const data = await res.json()

      if (!data.success) {
        // Even if API fails, show the error message nicely in chat
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm currently unable to access the medical database. Please try again or contact a coordinator directly.",
          isError: true
        }])
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.answer,
          citations: data.citations
        }])
      }

    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting to the server. Please check your connection.",
        isError: true
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Suggested queries for quick start
  const suggestions = [
    "How much is full-mouth dental implants?",
    "Best rhinoplasty clinics for revision surgery",
    "What is included in the health checkup package?",
    "Do I need a visa for medical treatment?"
  ]

  return (
    <div className="flex flex-col h-screen bg-[#0a0f1c] text-white font-sans selection:bg-teal-500/30">
      {/* Header */}
      <header className="flex-none bg-[#0a0f1c]/80 backdrop-blur-md border-b border-white/5 py-4 z-20 sticky top-0">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20">
              <Bot className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">Treatment Advisor</h1>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">System Online</span>
              </div>
            </div>
          </div>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
            Exit
          </Link>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 overflow-hidden relative container mx-auto max-w-5xl w-full flex flex-col md:flex-row gap-6 p-4 md:p-6">

        {/* Visual Sidebar (Desktop only) */}
        <div className="hidden md:flex flex-col w-1/3 gap-4">
          <div className="p-6 rounded-2xl bg-[#111827] border border-white/5 shadow-2xl space-y-4">
            <div className="w-10 h-10 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-400" />
            </div>
            <h2 className="text-xl font-bold text-white">AI-Powered<br />Medical Intelligence</h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Our RAG (Retrieval Augmented Generation) engine searches through thousands of verified medical documents, clinic accreditations, and successful detailed case studies to give you accurate answers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-teal-900/20 to-blue-900/20 border border-white/5 space-y-2">
            <h3 className="text-xs font-bold text-teal-400 uppercase mb-2">Verified Sources</h3>
            {['JCI Accreditation Standards', 'K-Health Database 2024', 'Clinic Price Lists Q4'].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-1 h-1 rounded-full bg-teal-500"></div> {s}
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Window */}
        <div className="flex-1 flex flex-col rounded-2xl bg-[#111827] border border-white/5 shadow-2xl overflow-hidden relative">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollRef}>
            <div className="flex flex-col gap-6 pb-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex gap-4 max-w-[85%]",
                    msg.role === 'user' ? "self-end flex-row-reverse" : "self-start"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border mt-1",
                    msg.role === 'user'
                      ? "bg-white text-black border-white"
                      : "bg-teal-500/10 text-teal-400 border-teal-500/20"
                  )}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed shadow-lg relative",
                    msg.role === 'user'
                      ? "bg-white text-black rounded-tr-none"
                      : cn("bg-[#1f2937] text-gray-200 rounded-tl-none border border-white/5", msg.isError && "border-red-500/30 bg-red-950/10 text-red-200")
                  )}>
                    {msg.isError ? (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        {msg.content}
                      </div>
                    ) : (
                      <TreatmentAdvisorMarkdown content={msg.content} citations={msg.citations} />
                    )}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 self-start">
                  <div className="w-8 h-8 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-[#1f2937] border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-3">
                    <div className="flex gap-1 h-3 items-center">
                      <motion.div animate={{ height: [4, 12, 4] }} transition={{ duration: 1, repeat: Infinity }} className="w-1 bg-teal-500/50 rounded-full" />
                      <motion.div animate={{ height: [4, 12, 4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1 bg-teal-500/50 rounded-full" />
                      <motion.div animate={{ height: [4, 12, 4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1 bg-teal-500/50 rounded-full" />
                    </div>
                    <span className="text-xs text-gray-500 font-mono">Analyzing medical data...</span>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-[#0a0f1c]/50 border-t border-white/5 backdrop-blur-sm z-10">
            {/* Auto-suggestions (only show if no history or idle) */}
            {messages.length < 3 && !isLoading && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-2 scrollbar-hide mask-fade-right">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(s)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-[#1f2937] hover:bg-teal-900/30 border border-white/10 hover:border-teal-500/30 text-xs text-gray-400 hover:text-teal-300 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
              <div className="relative flex items-center bg-[#111827] rounded-xl overflow-hidden shadow-xl border border-white/5">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Describe your symptoms or desired procedure..."
                  className="bg-transparent border-none text-white placeholder:text-gray-600 py-6 px-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="mr-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/20"
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
