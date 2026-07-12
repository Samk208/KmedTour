/**
 * Safety guards for RAG chat — exported for unit testing.
 *
 * The patient audience is Africa-facing and multilingual, so the deterministic
 * crisis short-circuit must fire regardless of language or diacritics. `normalize`
 * folds Latin accents (sévère → severe), French elision (n'arrive → narrive) and
 * Arabic orthographic variants (أ/إ/آ → ا, ة → ه, ى/ئ → ي) so keyword matching is
 * robust to how a distressed user actually types.
 */

const ARABIC_MARKS = /[ً-ْٰٕٖٓٔٗ٘]/g

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Latin combining accents
    .replace(ARABIC_MARKS, '') // Arabic harakat + hamza marks (incl. post-NFD)
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ىئ]/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ة/g, 'ه')
    .replace(/['’‘`ʼ]/g, '') // French elision apostrophes
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Keywords are stored already-normalized; input is normalized before matching.
export const EMERGENCY_KEYWORDS = [
  // English
  'chest pain', 'heart attack', 'cant breathe', 'difficulty breathing',
  'severe bleeding', 'heavy bleeding', 'suicide', 'kill myself', 'overdose',
  'unconscious', 'stroke', 'seizure', 'emergency',
  // French
  'douleur thoracique', 'crise cardiaque', 'arrive pas a respirer',
  'peux pas respirer', 'mal a respirer', 'difficulte a respirer', 'hemorragie',
  'saignement abondant', 'inconscient', 'evanoui', 'convulsion',
  'accident vasculaire', 'urgence',
  // Portuguese
  'dor no peito', 'ataque cardiaco', 'nao consigo respirar',
  'dificuldade para respirar', 'sangramento intenso', 'inconsciente',
  'convulsao', 'emergencia', 'suicidio',
  // Arabic
  'الم في الصدر', 'وجع في الصدر', 'استطيع التنفس', 'صعوبه في التنفس',
  'ضيق التنفس', 'نوبه قلبيه', 'ازمه قلبيه', 'نزيف', 'انتحار', 'طواري',
]

export const MEDICAL_ADVICE_PHRASES = [
  'should i get',
  'should i have',
  'diagnose',
  "what's wrong with",
  'am i sick',
  'what medication',
  'what treatment',
]

// "do i need" only solicits medical advice when it names a clinical object.
// Bare "do i need a visa/flight/hotel?" is logistics, not advice. The FR/PT
// patterns mirror this: a should/must-I stem is advice only with a clinical noun,
// so "devrais-je réserver un hôtel" stays logistics.
export const MEDICAL_ADVICE_PATTERNS = [
  /\bdo i need (a |an |the )?(surgery|operation|treatment|procedure|medication|medicine|biopsy|scan|implant)/,
  /\b(devrais je|dois je)\b.*(chirurgie|operation|traitement|intervention|medicament|implant|biopsie)/,
  /\b(devo|deveria)\b.*(cirurgia|operacao|tratamento|procedimento|medicamento|implante|biopsia)/,
]

export function isEmergency(text: string): boolean {
  const q = normalize(text)
  return EMERGENCY_KEYWORDS.some((k) => q.includes(k))
}

export function isMedicalAdvice(text: string): boolean {
  const q = normalize(text)
  return (
    MEDICAL_ADVICE_PHRASES.some((k) => q.includes(k)) ||
    MEDICAL_ADVICE_PATTERNS.some((re) => re.test(q))
  )
}
