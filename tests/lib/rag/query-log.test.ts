import { describe, it, expect, vi } from 'vitest'
import { logQuery, type QueryLogEntry } from '@/lib/rag/query-log'

const entry = (over: Partial<QueryLogEntry> = {}): QueryLogEntry => ({
  question: 'how much are dental implants?',
  route: 'rag',
  top_similarity: 0.8,
  num_results: 8,
  citations: [{ title: 'Dental Implants', source_url: '/procedures/dental-implants', similarity: 0.8 }],
  ...over,
})

function fakeClient(insertImpl: () => Promise<{ error: unknown }>) {
  const insert = vi.fn(insertImpl)
  // cast: the real AdminClient is a full supabase client; the test only needs .from().insert()
  const client = { from: () => ({ insert }) } as never
  return { client, insert }
}

describe('logQuery', () => {
  it('inserts the entry into rag_query_log', async () => {
    const { client, insert } = fakeClient(async () => ({ error: null }))
    const e = entry()
    await logQuery(client, e)
    expect(insert).toHaveBeenCalledWith(e)
  })

  it('resolves without throwing when the insert returns an error', async () => {
    const { client } = fakeClient(async () => ({ error: { message: 'boom' } }))
    await expect(logQuery(client, entry())).resolves.toBeUndefined()
  })

  it('resolves without throwing when the client itself throws', async () => {
    const client = { from: () => ({ insert: async () => { throw new Error('network down') } }) } as never
    await expect(logQuery(client, entry({ route: 'fallback', num_results: 0, top_similarity: null }))).resolves.toBeUndefined()
  })
})
