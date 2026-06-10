'use client'

/**
 * Browser client for the KmedTour voice concierge.
 *
 * Fetches a locked ephemeral token from /api/voice/token, connects directly to
 * the Gemini Live API with @google/genai, streams mic audio up (16 kHz PCM16)
 * and plays model audio back (24 kHz PCM16) with barge-in support. Tool calls
 * (search_kmedtour) are executed against /api/rag/retrieve, which guard-gates
 * emergency / medical-advice queries server-side.
 */

import { GoogleGenAI, type LiveServerMessage, type Session } from '@google/genai'

export type VoiceState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error'

export interface VoiceCallbacks {
  onStateChange: (state: VoiceState) => void
  onTranscript: (role: 'user' | 'assistant', text: string, final: boolean) => void
  onError: (message: string) => void
}

const INPUT_RATE = 16000
const OUTPUT_RATE = 24000

function floatTo16BitPCMBase64(float32: Float32Array): string {
  const buffer = new ArrayBuffer(float32.length * 2)
  const view = new DataView(buffer)
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]))
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function downsample(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return input
  const ratio = fromRate / toRate
  const outLength = Math.floor(input.length / ratio)
  const out = new Float32Array(outLength)
  for (let i = 0; i < outLength; i++) {
    out[i] = input[Math.floor(i * ratio)]
  }
  return out
}

export class VoiceLiveClient {
  private session: Session | null = null
  private micStream: MediaStream | null = null
  private micContext: AudioContext | null = null
  private micNode: ScriptProcessorNode | null = null
  private playContext: AudioContext | null = null
  private playQueueTime = 0
  private activeSources: AudioBufferSourceNode[] = []
  private callbacks: VoiceCallbacks
  private userTranscript = ''
  private assistantTranscript = ''
  private closed = false

  constructor(callbacks: VoiceCallbacks) {
    this.callbacks = callbacks
  }

  async start(): Promise<void> {
    this.closed = false
    this.callbacks.onStateChange('connecting')

    // 1. mic permission first — fail fast before burning a token
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      })
    } catch {
      this.callbacks.onError('mic-denied')
      this.callbacks.onStateChange('error')
      return
    }

    // 2. locked ephemeral token
    let token: string, model: string
    try {
      const res = await fetch('/api/voice/token', { method: 'POST' })
      const json = await res.json()
      if (!res.ok || !json.token) throw new Error(json?.error || 'token failed')
      token = json.token
      model = json.model
    } catch {
      this.stopMic()
      this.callbacks.onError('Voice is unavailable right now. Please use text chat.')
      this.callbacks.onStateChange('error')
      return
    }

    // 3. connect directly to the Live API (config is locked in the token)
    try {
      const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } })
      this.session = await ai.live.connect({
        model: `models/${model}`,
        callbacks: {
          onmessage: (msg) => this.handleMessage(msg),
          onerror: () => this.fail('Connection error. Please try again.'),
          onclose: () => {
            if (!this.closed) this.fail('Voice session ended. Tap the mic to reconnect.')
          },
        },
      })
    } catch {
      this.stopMic()
      this.callbacks.onError('Could not connect. Please try again or use text chat.')
      this.callbacks.onStateChange('error')
      return
    }

    this.startMicPump()
    this.callbacks.onStateChange('listening')
  }

  stop(): void {
    this.closed = true
    this.stopPlayback()
    this.stopMic()
    try {
      this.session?.close()
    } catch {
      /* already closed */
    }
    this.session = null
    this.callbacks.onStateChange('idle')
  }

  private fail(message: string) {
    if (this.closed) return
    this.closed = true
    this.stopPlayback()
    this.stopMic()
    this.session = null
    this.callbacks.onError(message)
    this.callbacks.onStateChange('error')
  }

  // --- mic upstream ---

  private startMicPump() {
    if (!this.micStream) return
    this.micContext = new AudioContext()
    const source = this.micContext.createMediaStreamSource(this.micStream)
    // ScriptProcessor is deprecated but universally supported; 4096 samples ≈ 90 ms at 44.1 kHz
    this.micNode = this.micContext.createScriptProcessor(4096, 1, 1)
    const contextRate = this.micContext.sampleRate
    this.micNode.onaudioprocess = (e) => {
      if (!this.session || this.closed) return
      const ds = downsample(e.inputBuffer.getChannelData(0), contextRate, INPUT_RATE)
      try {
        this.session.sendRealtimeInput({
          audio: { data: floatTo16BitPCMBase64(ds), mimeType: `audio/pcm;rate=${INPUT_RATE}` },
        })
      } catch {
        /* session closing */
      }
    }
    source.connect(this.micNode)
    this.micNode.connect(this.micContext.destination)
  }

  private stopMic() {
    this.micNode?.disconnect()
    this.micNode = null
    this.micContext?.close().catch(() => undefined)
    this.micContext = null
    this.micStream?.getTracks().forEach((t) => t.stop())
    this.micStream = null
  }

  // --- model audio downstream ---

  private playPcmChunk(base64: string) {
    if (!this.playContext) {
      this.playContext = new AudioContext({ sampleRate: OUTPUT_RATE })
      this.playQueueTime = this.playContext.currentTime
    }
    const binary = atob(base64)
    const samples = binary.length / 2
    const audioBuffer = this.playContext.createBuffer(1, samples, OUTPUT_RATE)
    const channel = audioBuffer.getChannelData(0)
    for (let i = 0; i < samples; i++) {
      const lo = binary.charCodeAt(i * 2)
      const hi = binary.charCodeAt(i * 2 + 1)
      let val = (hi << 8) | lo
      if (val >= 0x8000) val -= 0x10000
      channel[i] = val / 0x8000
    }
    const source = this.playContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(this.playContext.destination)
    const startAt = Math.max(this.playQueueTime, this.playContext.currentTime)
    source.start(startAt)
    this.playQueueTime = startAt + audioBuffer.duration
    this.activeSources.push(source)
    source.onended = () => {
      this.activeSources = this.activeSources.filter((s) => s !== source)
      if (this.activeSources.length === 0 && !this.closed) {
        this.callbacks.onStateChange('listening')
      }
    }
    this.callbacks.onStateChange('speaking')
  }

  private stopPlayback() {
    for (const s of this.activeSources) {
      try {
        s.stop()
      } catch {
        /* already stopped */
      }
    }
    this.activeSources = []
    if (this.playContext) this.playQueueTime = this.playContext.currentTime
  }

  // --- protocol ---

  private async handleMessage(msg: LiveServerMessage) {
    const serverContent = msg.serverContent

    if (serverContent?.interrupted) {
      // barge-in: user spoke over the model
      this.stopPlayback()
      this.callbacks.onStateChange('listening')
    }

    if (serverContent?.inputTranscription?.text) {
      this.userTranscript += serverContent.inputTranscription.text
      this.callbacks.onTranscript('user', this.userTranscript, false)
    }
    if (serverContent?.outputTranscription?.text) {
      this.assistantTranscript += serverContent.outputTranscription.text
      this.callbacks.onTranscript('assistant', this.assistantTranscript, false)
    }

    if (serverContent?.modelTurn?.parts) {
      for (const part of serverContent.modelTurn.parts) {
        if (part.inlineData?.data && part.inlineData.mimeType?.startsWith('audio/pcm')) {
          this.playPcmChunk(part.inlineData.data)
        }
      }
    }

    if (serverContent?.turnComplete) {
      if (this.userTranscript) this.callbacks.onTranscript('user', this.userTranscript, true)
      if (this.assistantTranscript) this.callbacks.onTranscript('assistant', this.assistantTranscript, true)
      this.userTranscript = ''
      this.assistantTranscript = ''
    }

    if (msg.toolCall?.functionCalls?.length) {
      await this.handleToolCalls(msg.toolCall.functionCalls)
    }
  }

  private async handleToolCalls(calls: Array<{ id?: string; name?: string; args?: Record<string, unknown> }>) {
    const responses = await Promise.all(
      calls.map(async (call) => {
        let response: unknown
        try {
          const res = await fetch('/api/rag/retrieve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: call.args?.query || '' }),
          })
          response = res.ok
            ? await res.json()
            : { directive: null, chunks: [], error: 'Search is unavailable; apologize and suggest text chat.' }
        } catch {
          response = { directive: null, chunks: [], error: 'Search is unavailable; apologize and suggest text chat.' }
        }
        return { id: call.id, name: call.name, response: response as Record<string, unknown> }
      }),
    )
    try {
      this.session?.sendToolResponse({ functionResponses: responses })
    } catch {
      /* session closing */
    }
  }
}
