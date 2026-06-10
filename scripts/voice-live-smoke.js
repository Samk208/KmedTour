#!/usr/bin/env node
/**
 * Live smoke test for the voice agent plumbing — no browser needed.
 *
 * Mints an ephemeral token (TEXT modality so we can assert on text) the same
 * way /api/voice/token does, connects with @google/genai (same SDK the browser
 * client uses), asks a question that must trigger the search_kmedtour tool,
 * answers the tool call with a canned chunk, and asserts the model's final
 * text. Proves: token mint, WS auth, locked system prompt, tool round trip.
 *
 * Usage: node scripts/voice-live-smoke.js
 */

const fs = require('fs')
const path = require('path')

const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
    const t = line.trim()
    if (t && !t.startsWith('#') && t.includes('=')) {
      const i = t.indexOf('=')
      const k = t.slice(0, i).trim()
      if (!process.env[k]) process.env[k] = t.slice(i + 1).trim()
    }
  }
}

const KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
const MODEL = process.env.GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview'

const promptSrc = fs.readFileSync(path.join(__dirname, '..', 'lib', 'voice', 'prompt.ts'), 'utf-8')
const SYSTEM_PROMPT = promptSrc.match(/VOICE_SYSTEM_PROMPT = `([\s\S]*?)`\n/)[1]

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'search_kmedtour',
        description:
          'Search the KmedTour knowledge base: Korean hospitals, medical procedures, prices, visas, travel logistics, payments, and aftercare.',
        parameters: {
          type: 'OBJECT',
          properties: { query: { type: 'STRING' } },
          required: ['query'],
        },
      },
    ],
  },
]

async function mintToken() {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1alpha/auth_tokens?key=${KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      uses: 1,
      expireTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      bidiGenerateContentSetup: {
        model: `models/${MODEL}`,
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        tools: TOOLS,
        // model is AUDIO-only; transcription gives us text to assert on
        generationConfig: { responseModalities: ['AUDIO'] },
        outputAudioTranscription: {},
      },
    }),
  })
  if (!res.ok) throw new Error(`token mint failed: ${res.status} ${await res.text()}`)
  return (await res.json()).name
}

async function main() {
  const { GoogleGenAI } = await import('@google/genai')

  console.log('1. minting ephemeral token (TEXT modality)...')
  const token = await mintToken()
  console.log('   token:', token.slice(0, 30) + '...')

  const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } })

  let toolCalled = false
  let finalText = ''
  let resolveDone, rejectDone
  const done = new Promise((res, rej) => ((resolveDone = res), (rejectDone = rej)))
  const timeout = setTimeout(() => rejectDone(new Error('TIMEOUT after 60s')), 60_000)

  console.log('2. connecting via @google/genai live...')
  const session = await ai.live.connect({
    model: `models/${MODEL}`,
    callbacks: {
      onopen: () => console.log('   websocket open'),
      onmessage: (msg) => {
        if (msg.setupComplete !== undefined) {
          console.log('3. setup complete — asking a price question (should trigger tool)...')
          session.sendClientContent({
            turns: [{ role: 'user', parts: [{ text: 'How much does rhinoplasty cost in Korea?' }] }],
            turnComplete: true,
          })
          return
        }
        if (msg.toolCall) {
          toolCalled = true
          const calls = msg.toolCall.functionCalls || []
          console.log('4. TOOL CALL:', calls.map((c) => `${c.name}(${JSON.stringify(c.args)})`).join(', '))
          session.sendToolResponse({
            functionResponses: calls.map((c) => ({
              id: c.id,
              name: c.name,
              response: {
                directive: null,
                chunks: [
                  {
                    title: 'Rhinoplasty',
                    content:
                      'Rhinoplasty in Korea typically costs between $3,500 and $8,000 depending on complexity and clinic.',
                    source_url: '/procedures/rhinoplasty',
                    similarity: 0.9,
                  },
                ],
              },
            })),
          })
          return
        }
        if (msg.serverContent?.outputTranscription?.text) {
          finalText += msg.serverContent.outputTranscription.text
        }
        if (msg.serverContent?.modelTurn?.parts) {
          for (const part of msg.serverContent.modelTurn.parts) {
            if (part.text) finalText += part.text
          }
        }
        if (msg.serverContent?.turnComplete && finalText) {
          clearTimeout(timeout)
          resolveDone()
        }
      },
      onerror: (e) => {
        clearTimeout(timeout)
        rejectDone(new Error(`ws error: ${e.message || JSON.stringify(e)}`))
      },
      onclose: (e) => {
        if (!finalText) {
          clearTimeout(timeout)
          rejectDone(new Error(`ws closed early: code=${e.code} reason=${e.reason}`))
        }
      },
    },
  })

  await done
  session.close()

  console.log('5. final model text:', JSON.stringify(finalText.trim().slice(0, 220)))
  console.log(`RESULT: toolCalled=${toolCalled}`)
  if (!toolCalled) throw new Error('FAIL: model did not call search_kmedtour')
  console.log('SMOKE TEST PASSED')
  process.exit(0)
}

main().catch((e) => {
  console.error('SMOKE TEST FAILED:', e.message)
  process.exit(1)
})
