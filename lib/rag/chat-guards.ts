/**
 * Safety guards for RAG chat — exported for unit testing.
 */

export const EMERGENCY_KEYWORDS = [
  'chest pain',
  'heart attack',
  "can't breathe",
  'difficulty breathing',
  'severe bleeding',
  'heavy bleeding',
  'suicide',
  'kill myself',
  'overdose',
  'unconscious',
  'stroke',
  'seizure',
  'emergency',
]

export const MEDICAL_ADVICE_PHRASES = [
  'should i get',
  'should i have',
  'do i need',
  'diagnose',
  "what's wrong with",
  'am i sick',
  'what medication',
  'what treatment',
]

export function isEmergency(text: string): boolean {
  const q = text.toLowerCase()
  return EMERGENCY_KEYWORDS.some((k) => q.includes(k))
}

export function isMedicalAdvice(text: string): boolean {
  const q = text.toLowerCase()
  return MEDICAL_ADVICE_PHRASES.some((k) => q.includes(k))
}
