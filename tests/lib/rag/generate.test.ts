import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  buildContextBlock,
  generateAnswer,
  type RetrievedChunk,
} from '@/lib/rag/generate'

const chunk = (over: Partial<RetrievedChunk> = {}): RetrievedChunk => ({
  chunk_id: 'c1',
  document_id: 'd1',
  title: 'Visa Guide',
  source_url: '/content/articles/visa-guide',
  content: 'C-3-3 medical tourism visa details.',
  similarity: 0.8,
  metadata: null,
  ...over,
})

function mockFetchSequence(responses: Array<{ ok: boolean; status?: number; json?: unknown; text?: string }>) {
  const fn = vi.fn()
  for (const r of responses) {
    fn.mockResolvedValueOnce({
      ok: r.ok,
      status: r.status ?? (r.ok ? 200 : 500),
      json: async () => r.json ?? {},
      text: async () => r.text ?? '',
    })
  }
  vi.stubGlobal('fetch', fn)
  return fn
}

describe('rag/generate', () => {
  beforeEach(() => {
    vi.stubEnv('PYTHON_AGENT_URL', '')
    vi.stubEnv('GEMINI_API_KEY', 'test-gemini-key')
    vi.stubEnv('OPENROUTER_API_KEY', 'test-openrouter-key')
    vi.stubEnv('OPENAI_API_KEY', 'test-openai-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('buildContextBlock numbers entries and includes source urls', () => {
    const block = buildContextBlock([chunk(), chunk({ title: 'Prices', source_url: null })])
    expect(block).toContain('[1] Visa Guide (/content/articles/visa-guide)')
    expect(block).toContain('[2] Prices')
  })

  it('skips python agent when PYTHON_AGENT_URL is unset and answers via gemini', async () => {
    const fetchMock = mockFetchSequence([
      { ok: true, json: { candidates: [{ content: { parts: [{ text: 'Gemini answer [1]' }] } }] } },
    ])
    const answer = await generateAnswer('What visa do I need?', [chunk()])
    expect(answer).toBe('Gemini answer [1]')
    // only one call: gemini (python agent skipped without URL)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(String(fetchMock.mock.calls[0][0])).toContain('generativelanguage.googleapis.com')
  })

  it('falls back to deepseek (openrouter) when gemini fails', async () => {
    const fetchMock = mockFetchSequence([
      { ok: false, status: 429, text: 'quota' },
      { ok: true, json: { choices: [{ message: { content: 'DeepSeek answer' } }] } },
    ])
    const answer = await generateAnswer('question', [chunk()])
    expect(answer).toBe('DeepSeek answer')
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(String(fetchMock.mock.calls[1][0])).toContain('openrouter.ai')
  })

  it('falls back to openai when gemini and deepseek both fail', async () => {
    const fetchMock = mockFetchSequence([
      { ok: false, status: 429, text: 'quota' },
      { ok: false, status: 500, text: 'openrouter down' },
      { ok: true, json: { choices: [{ message: { content: 'OpenAI answer' } }] } },
    ])
    const answer = await generateAnswer('question', [chunk()])
    expect(answer).toBe('OpenAI answer')
    expect(String(fetchMock.mock.calls[2][0])).toContain('api.openai.com')
  })

  it('skips deepseek when OPENROUTER_API_KEY is unset', async () => {
    vi.stubEnv('OPENROUTER_API_KEY', '')
    const fetchMock = mockFetchSequence([
      { ok: false, status: 429, text: 'quota' },
      { ok: true, json: { choices: [{ message: { content: 'OpenAI answer' } }] } },
    ])
    const answer = await generateAnswer('question', [chunk()])
    expect(answer).toBe('OpenAI answer')
    expect(String(fetchMock.mock.calls[1][0])).toContain('api.openai.com')
  })

  it('tries python agent first when PYTHON_AGENT_URL is set', async () => {
    vi.stubEnv('PYTHON_AGENT_URL', 'http://agent.example')
    const fetchMock = mockFetchSequence([
      { ok: true, json: { response: 'Agent answer' } },
    ])
    const answer = await generateAnswer('question', [chunk()])
    expect(answer).toBe('Agent answer')
    expect(String(fetchMock.mock.calls[0][0])).toContain('http://agent.example/api/chat')
  })

  it('throws with provider details when all providers fail', async () => {
    mockFetchSequence([
      { ok: false, status: 500, text: 'gemini down' },
      { ok: false, status: 500, text: 'openrouter down' },
      { ok: false, status: 401, text: 'bad key' },
    ])
    await expect(generateAnswer('question', [chunk()])).rejects.toThrow(/gemini[\s\S]*deepseek[\s\S]*openai/)
  })

  it('threads conversation history into the gemini request', async () => {
    const fetchMock = mockFetchSequence([
      { ok: true, json: { candidates: [{ content: { parts: [{ text: 'answer' }] } }] } },
    ])
    await generateAnswer('and the recovery time?', [chunk()], [
      { role: 'user', content: 'tell me about rhinoplasty' },
      { role: 'assistant', content: 'It reshapes the nose.' },
    ])
    const body = JSON.parse(String(fetchMock.mock.calls[0][1].body))
    const flat = JSON.stringify(body.contents)
    expect(flat).toContain('tell me about rhinoplasty')
    expect(flat).toContain('It reshapes the nose')
    expect(flat).toContain('and the recovery time?')
  })

  it('threads conversation history into the openai request as prior messages', async () => {
    const fetchMock = mockFetchSequence([
      { ok: false, status: 429, text: 'quota' }, // gemini
      { ok: false, status: 500, text: 'down' }, // deepseek
      { ok: true, json: { choices: [{ message: { content: 'ok' } }] } }, // openai
    ])
    await generateAnswer('the price?', [chunk()], [{ role: 'user', content: 'dental implants' }])
    const body = JSON.parse(String(fetchMock.mock.calls[2][1].body))
    const roles = body.messages.map((m: { role: string }) => m.role)
    expect(roles[0]).toBe('system')
    expect(JSON.stringify(body.messages)).toContain('dental implants')
    expect(body.messages[body.messages.length - 1].content).toContain('the price?')
  })

  it('does not return empty answers — treats empty gemini response as failure', async () => {
    mockFetchSequence([
      { ok: true, json: { candidates: [] } },
      { ok: true, json: { choices: [{ message: { content: 'OpenAI rescue' } }] } },
    ])
    const answer = await generateAnswer('question', [chunk()])
    expect(answer).toBe('OpenAI rescue')
  })
})
