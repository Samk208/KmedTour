import type { getSupabaseAdminContext } from '@/lib/api/client/supabase'
import { logger } from '@/lib/utils/logger'

type AdminClient = NonNullable<ReturnType<typeof getSupabaseAdminContext>['client']>

export type QueryLogEntry = {
  question: string
  route: 'rag' | 'fallback'
  top_similarity: number | null
  num_results: number
  citations: { title: string; source_url: string | null; similarity: number }[]
}

/**
 * Fire-and-forget analytics write for the corpus-gap feedback loop.
 * NEVER throws — a logging failure must not affect the user's answer.
 * Only rag/fallback routes are logged (safety routes are excluded upstream).
 */
export async function logQuery(client: AdminClient, entry: QueryLogEntry): Promise<void> {
  try {
    const { error } = await client.from('rag_query_log').insert(entry)
    if (error) {
      logger.warn('rag_query_log insert failed', { path: '/api/rag/chat' }, { error: error.message })
    }
  } catch (err) {
    logger.warn('rag_query_log insert threw', { path: '/api/rag/chat' }, { error: err instanceof Error ? err.message : 'unknown' })
  }
}
