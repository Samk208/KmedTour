export type ChatTurn = { role: 'user' | 'assistant'; content: string }

// Fold the most recent user turns into the retrieval query so follow-ups with
// pronouns ("how long does that one take?") embed against the right subject.
// Deterministic on purpose: no extra LLM call on the retrieval hot path.
const MAX_HISTORY_USER_TURNS = 2

export function condenseForRetrieval(message: string, history: ChatTurn[]): string {
  const recentUser = history
    .filter((t) => t.role === 'user')
    .slice(-MAX_HISTORY_USER_TURNS)
    .map((t) => t.content.trim())
    .filter(Boolean)

  if (recentUser.length === 0) return message
  return `${recentUser.join(' ')} ${message}`.trim()
}
