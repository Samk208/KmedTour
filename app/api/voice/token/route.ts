import { apiError, createErrorId } from '@/lib/utils/api-response'
import { logger } from '@/lib/utils/logger'
import { rateLimit as rateLimitMiddleware } from '@/lib/utils/rate-limit'
import { VOICE_SYSTEM_PROMPT, VOICE_TOOLS } from '@/lib/voice/prompt'
import { NextResponse } from 'next/server'

/**
 * Mints a single-use ephemeral token for the Gemini Live API. The model, voice
 * system prompt, and tool declarations are LOCKED into the token via
 * bidiGenerateContentSetup — the browser connects directly to Google but cannot
 * override any of them. The real API key never leaves the server.
 */

const TOKEN_LIMIT = Number(process.env.VOICE_TOKEN_RATE_LIMIT || 10)
const TOKEN_TTL_MINUTES = 30

export async function POST(request: Request) {
  try {
    const rateLimitResponse = await rateLimitMiddleware({
      limit: TOKEN_LIMIT,
      windowMs: 60_000,
      keyPrefix: 'voice-token',
    })(request)
    if (rateLimitResponse) return rateLimitResponse

    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (!key) {
      return apiError('Voice is not configured.', 503, { code: 'VOICE_NOT_CONFIGURED' })
    }

    const model = process.env.GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview'
    const expireTime = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000).toISOString()

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1alpha/auth_tokens?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uses: 1,
          expireTime,
          bidiGenerateContentSetup: {
            model: `models/${model}`,
            systemInstruction: { parts: [{ text: VOICE_SYSTEM_PROMPT }] },
            tools: VOICE_TOOLS,
            generationConfig: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: process.env.GEMINI_LIVE_VOICE || 'Kore' },
                },
              },
            },
            // transcripts let the widget show captions for both sides
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
        }),
      },
    )

    if (!res.ok) {
      const body = await res.text()
      logger.error('voice token mint failed', { path: '/api/voice/token' }, { status: res.status, body: body.slice(0, 300) })
      return apiError('Voice is unavailable right now.', 502, { code: 'VOICE_TOKEN_FAILED' })
    }

    const json = await res.json()
    if (!json?.name) {
      return apiError('Voice is unavailable right now.', 502, { code: 'VOICE_TOKEN_MALFORMED' })
    }

    return NextResponse.json({ success: true, token: json.name, expiresAt: expireTime, model })
  } catch (error) {
    const errorId = createErrorId('voice')
    logger.error('voice token request failed', { path: '/api/voice/token', method: 'POST' }, {
      errorId,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, error instanceof Error ? error : undefined)
    return apiError('Voice is unavailable right now.', 500, { errorId, code: 'VOICE_TOKEN_ERROR' })
  }
}
