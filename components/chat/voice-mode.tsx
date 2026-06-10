'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Mic, MicOff, Square } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { VoiceState } from '@/lib/voice/live-client'

type Props = {
  onTranscript: (role: 'user' | 'assistant', text: string, final: boolean) => void
  onError: (message: string) => void
}

/**
 * Mic toggle for the chat widget. Lazy-loads the Live client (and the
 * @google/genai SDK) only when the user first taps the mic.
 */
export function VoiceMode({ onTranscript, onError }: Props) {
  const [state, setState] = useState<VoiceState>('idle')
  const clientRef = useRef<import('@/lib/voice/live-client').VoiceLiveClient | null>(null)

  useEffect(() => {
    return () => clientRef.current?.stop()
  }, [])

  const toggle = async () => {
    if (state === 'idle' || state === 'error') {
      const { VoiceLiveClient } = await import('@/lib/voice/live-client')
      clientRef.current = new VoiceLiveClient({
        onStateChange: setState,
        onTranscript,
        onError: (msg) => {
          if (msg === 'mic-denied') {
            onError('Microphone access was denied — you can keep chatting by text.')
          } else {
            onError(msg)
          }
        },
      })
      await clientRef.current.start()
    } else {
      clientRef.current?.stop()
      clientRef.current = null
    }
  }

  const active = state === 'listening' || state === 'speaking' || state === 'connecting'

  return (
    <Button
      onClick={toggle}
      size="sm"
      variant={active ? 'default' : 'outline'}
      aria-label={active ? 'Stop voice conversation' : 'Start voice conversation'}
      title={active ? 'Stop voice' : 'Talk to the assistant'}
      className={cn(
        'shrink-0 relative',
        active
          ? 'bg-teal-600 hover:bg-red-500'
          : 'border-teal-200 text-teal-600 hover:bg-teal-50',
        state === 'listening' && 'animate-pulse',
      )}
    >
      {state === 'connecting' ? (
        <Mic className="h-4 w-4 animate-pulse opacity-60" />
      ) : active ? (
        <Square className="h-3.5 w-3.5" />
      ) : state === 'error' ? (
        <MicOff className="h-4 w-4" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
      {state === 'speaking' && (
        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-green-400 animate-ping" />
      )}
    </Button>
  )
}
