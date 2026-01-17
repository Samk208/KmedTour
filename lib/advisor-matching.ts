// Treatment Advisor matching logic
// Mock rules to suggest treatments based on user input

export interface AdvisorInput {
  symptoms: string[]
  duration: string
  budget: string
  language: string[]
}

export interface TreatmentMatch {
  id: string
  confidence: number // 0-100
  reasons: string[]
}

export function matchTreatments(input: AdvisorInput): TreatmentMatch[] {
  const matches: TreatmentMatch[] = []

  // Rule-based matching logic
  const { symptoms, duration, budget } = input

  // IVF matching
  if (symptoms.includes('infertility')) {
    const confidence = calculateConfidence(
      duration,
      ['twoWeeks', 'threeWeeks', 'fourWeeks', 'flexible'],
      budget,
      ['low', 'medium'],
      70
    )
    if (confidence > 0) {
      matches.push({
        id: 'ivf',
        confidence,
        reasons: [
          'Matches your fertility concerns',
          'Aligns with your budget',
          'Fits your available duration',
        ],
      })
    }
  }

  // Plastic Surgery matching
  if (symptoms.includes('cosmeticConcerns')) {
    const confidence = calculateConfidence(
      duration,
      ['oneWeek', 'twoWeeks', 'threeWeeks', 'flexible'],
      budget,
      ['low', 'medium', 'high'],
      75
    )
    if (confidence > 0) {
      matches.push({
        id: 'plastic-surgery',
        confidence,
        reasons: [
          'Matches your cosmetic goals',
          'Wide range of procedures available',
          'Suitable for your timeframe',
        ],
      })
    }
  }

  // Dental Implants matching
  if (symptoms.includes('dentalIssues')) {
    const confidence = calculateConfidence(
      duration,
      ['oneWeek', 'twoWeeks', 'flexible'],
      budget,
      ['low', 'medium'],
      80
    )
    if (confidence > 0) {
      matches.push({
        id: 'dental-implants',
        confidence,
        reasons: [
          'Ideal for dental restoration',
          'Short treatment duration',
          'Cost-effective solution',
        ],
      })
    }
  }

  // Cancer Treatment matching
  if (symptoms.includes('cancer')) {
    const confidence = calculateConfidence(
      duration,
      ['twoWeeks', 'threeWeeks', 'fourWeeks', 'flexible'],
      budget,
      ['medium', 'high', 'veryHigh'],
      85
    )
    if (confidence > 0) {
      matches.push({
        id: 'cancer-treatment',
        confidence,
        reasons: [
          'Specialized oncology care',
          'Advanced treatment options',
          'Comprehensive support',
        ],
      })
    }
  }

  // Orthopedic Surgery matching
  if (symptoms.includes('jointPain')) {
    const confidence = calculateConfidence(
      duration,
      ['twoWeeks', 'threeWeeks', 'fourWeeks', 'flexible'],
      budget,
      ['medium', 'high'],
      75
    )
    if (confidence > 0) {
      matches.push({
        id: 'orthopedic-surgery',
        confidence,
        reasons: [
          'Addresses joint and mobility issues',
          'Advanced surgical techniques',
          'Fast recovery protocols',
        ],
      })
    }
  }

  // Cardiac Surgery matching
  if (symptoms.includes('heartCondition')) {
    const confidence = calculateConfidence(
      duration,
      ['twoWeeks', 'threeWeeks', 'fourWeeks', 'flexible'],
      budget,
      ['high', 'veryHigh'],
      80
    )
    if (confidence > 0) {
      matches.push({
        id: 'cardiac-surgery',
        confidence,
        reasons: [
          'World-class cardiac care',
          'Expert surgeons',
          'Latest technology',
        ],
      })
    }
  }

  // Sort by confidence (highest first) and return top 3
  return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 3)
}

function calculateConfidence(
  userDuration: string,
  idealDurations: string[],
  userBudget: string,
  idealBudgets: string[],
  baseConfidence: number
): number {
  let confidence = baseConfidence

  // Duration match
  if (idealDurations.includes(userDuration)) {
    confidence += 10
  } else {
    confidence -= 20
  }

  // Budget match
  if (idealBudgets.includes(userBudget)) {
    confidence += 10
  } else if (userBudget === 'unsure') {
    // Neutral if unsure
  } else {
    confidence -= 15
  }

  // Ensure confidence is between 0 and 100
  return Math.max(0, Math.min(100, confidence))
}
