'use client'

import { AdvisorStep } from '@/components/advisor/advisor-step'
import { OptionCard } from '@/components/advisor/option-card'
import { Button } from '@/components/ui/button'
import { type AdvisorInput } from '@/lib/advisor-matching'
import { useTreatmentsQuery } from '@/lib/api/hooks/use-treatments'
import { ArrowLeft, ArrowRight, CheckCircle, Clock, DollarSign, Globe, Heart, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

// Result shape for grounded advisor suggestions
const matchSchema = z.object({
  matches: z.array(z.object({
    id: z.string(),
    confidence: z.number(),
    reasons: z.array(z.string())
  })),
  reasoning: z.string().optional()
})

export default function TreatmentAdvisorPage() {
  const { t } = useTranslation('common')
  const { data: treatments = [] } = useTreatmentsQuery()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<AdvisorInput>({
    symptoms: [],
    duration: '',
    budget: '',
    language: [],
  })

  const [advisorResult, setAdvisorResult] = useState<z.infer<typeof matchSchema> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalSteps = 4

  const handleSymptomToggle = (symptom: string) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }))
  }

  const handleDurationSelect = (duration: string) => {
    setFormData((prev) => ({ ...prev, duration }))
  }

  const handleBudgetSelect = (budget: string) => {
    setFormData((prev) => ({ ...prev, budget }))
  }

  const handleLanguageToggle = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      language: prev.language.includes(language)
        ? prev.language.filter((l) => l !== language)
        : [...prev.language, language],
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleSubmit()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleStartOver = () => {
    setFormData({
      symptoms: [],
      duration: '',
      budget: '',
      language: [],
    })
    setAdvisorResult(null)
    setError(null)
    setCurrentStep(1)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/treatment-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          treatmentType: formData.symptoms.join(', ') || formData.duration || 'general',
          countryOfResidence: undefined,
          budgetRange: formData.budget,
          preferredLanguage: formData.language[0],
        }),
      })
      if (!res.ok) throw new Error('Advisor request failed')
      const json = await res.json()
      const mapped = {
        matches: (json?.suggestions || []).map((s: any) => ({
          id: String(s.id),
          confidence: Number(s.confidence ?? 0.7),
          reasons: [s.reason || 'Matched to your request'],
        })),
        reasoning: undefined,
      }
      setAdvisorResult(matchSchema.parse(mapped))
    } catch (e: any) {
      console.error(e)
      setError('Unable to generate suggestions right now.')
    } finally {
      setIsLoading(false)
      setCurrentStep(5)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.symptoms.length > 0
      case 2:
        return formData.duration !== ''
      case 3:
        return formData.budget !== ''
      case 4:
        return formData.language.length > 0
      default:
        return false
    }
  }

  // --- RESULTS VIEW ---
  if (currentStep === 5) {
    // Show Loading
    if (isLoading && !advisorResult) {
      return (
        <div className="min-h-screen bg-white py-12 px-4 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 bg-[var(--kmed-teal-light)] animate-pulse">
            <Sparkles className="w-10 h-10 text-[var(--kmed-teal)]" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[var(--kmed-navy)]">k-Med AI is analyzing...</h2>
          <p className="text-[var(--medium-grey)] max-w-md">
            Comparing your profile against {treatments.length} proprietary treatment protocols.
          </p>
        </div>
      )
    }

    if (error) {
      return (
        <div className="min-h-screen bg-white py-12 px-4 text-center">
          <h2 className="text-xl font-bold text-red-500 mb-4">Analysis Failed</h2>
          <p className="mb-6">We encountered an error connecting to the AI Advisor.</p>
          <Button onClick={handleStartOver} variant="outline">Try Again</Button>
        </div>
      )
    }

    // Prepare Matches
    const matchesArray = advisorResult?.matches || []
    const matchedTreatments = matchesArray
      .map((match) => {
        const treatment = treatments.find((t) => t.id === match.id)
        return treatment ? { ...treatment, ...match } : null
      })
      .filter((treatment): treatment is NonNullable<typeof treatment> => treatment !== null)
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))

    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'var(--kmed-teal)' }}>
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--deep-grey)' }}>
              {t('advisor.results.title')}
            </h1>

            {/* AI Reasoning Box */}
            {advisorResult?.reasoning && (
              <div className="bg-[var(--soft-grey)] p-6 rounded-lg text-left max-w-2xl mx-auto mb-8 border border-[var(--border-grey)]">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[var(--kmed-teal)]" />
                  <h4 className="font-semibold text-[var(--kmed-navy)]">Advisor Analysis</h4>
                </div>
                <p className="text-sm leading-relaxed text-[var(--deep-grey)]">
                  {advisorResult.reasoning}
                </p>
              </div>
            )}
          </div>

          {matchedTreatments.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <p className="text-lg mb-6" style={{ color: 'var(--medium-grey)' }}>
                {t('advisor.results.noMatches')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/patient-intake">
                  <Button className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white">
                    {t('advisor.results.requestConcierge')}
                  </Button>
                </Link>
                <Button variant="outline" onClick={handleStartOver}>
                  {t('advisor.results.startOver')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {matchedTreatments.map((treatment) => (
                <div
                  key={treatment.id}
                  className="border-2 rounded-lg p-6 hover:shadow-lg transition-shadow"
                  style={{ borderColor: 'var(--border-grey)' }}
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--deep-grey)' }}>
                            {treatment.title}
                          </h3>
                          <p className="text-sm" style={{ color: 'var(--medium-grey)' }}>
                            {treatment.shortDescription}
                          </p>
                        </div>
                        <div
                          className="px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4"
                          style={{
                            backgroundColor: 'var(--kmed-teal-light)',
                            color: 'var(--kmed-teal)',
                          }}
                        >
                          {treatment.confidence}% {t('advisor.results.confidence')}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" style={{ color: 'var(--kmed-blue)' }} />
                          <span className="text-sm font-medium">{treatment.priceRange}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" style={{ color: 'var(--kmed-blue)' }} />
                          <span className="text-sm font-medium">{treatment.duration}</span>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {treatment.reasons.map((reason, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle
                              className="w-4 h-4 mt-0.5 flex-shrink-0"
                              style={{ color: 'var(--kmed-teal)' }}
                            />
                            <span className="text-sm" style={{ color: 'var(--medium-grey)' }}>
                              {reason}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="flex gap-3">
                        <Link href={`/hospitals/${treatment.slug}`}>
                          <Button variant="outline" size="sm">
                            {t('advisor.results.viewDetails')}
                          </Button>
                        </Link>
                        <Link href="/patient-intake">
                          <Button
                            size="sm"
                            className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
                          >
                            {t('advisor.results.requestConcierge')}
                            <ArrowRight className="ml-2 w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-center pt-6">
                <Button variant="outline" onClick={handleStartOver}>
                  {t('advisor.results.startOver')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- WIZARD STEPS VIEW ---
  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--deep-grey)' }}>
            {t('advisor.title')}
          </h1>
          <p className="text-lg" style={{ color: 'var(--medium-grey)' }}>
            {t('advisor.subtitle')}
          </p>
        </div>

        {/* Step 1: Symptoms */}
        {currentStep === 1 && (
          <AdvisorStep
            title={t('advisor.step1.title')}
            subtitle={t('advisor.step1.subtitle')}
            currentStep={currentStep}
            totalSteps={totalSteps}
          >
            <div className="grid gap-4">
              <OptionCard
                label={t('advisor.step1.infertility')}
                value="infertility"
                selected={formData.symptoms.includes('infertility')}
                onClick={() => handleSymptomToggle('infertility')}
                icon={<Heart className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step1.cosmeticConcerns')}
                value="cosmeticConcerns"
                selected={formData.symptoms.includes('cosmeticConcerns')}
                onClick={() => handleSymptomToggle('cosmeticConcerns')}
                icon={<Heart className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step1.dentalIssues')}
                value="dentalIssues"
                selected={formData.symptoms.includes('dentalIssues')}
                onClick={() => handleSymptomToggle('dentalIssues')}
                icon={<Heart className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step1.cancer')}
                value="cancer"
                selected={formData.symptoms.includes('cancer')}
                onClick={() => handleSymptomToggle('cancer')}
                icon={<Heart className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step1.jointPain')}
                value="jointPain"
                selected={formData.symptoms.includes('jointPain')}
                onClick={() => handleSymptomToggle('jointPain')}
                icon={<Heart className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step1.heartCondition')}
                value="heartCondition"
                selected={formData.symptoms.includes('heartCondition')}
                onClick={() => handleSymptomToggle('heartCondition')}
                icon={<Heart className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step1.other')}
                value="other"
                selected={formData.symptoms.includes('other')}
                onClick={() => handleSymptomToggle('other')}
                icon={<Heart className="w-5 h-5" />}
              />
            </div>
          </AdvisorStep>
        )}

        {/* Step 2: Duration */}
        {currentStep === 2 && (
          <AdvisorStep
            title={t('advisor.step2.title')}
            subtitle={t('advisor.step2.subtitle')}
            currentStep={currentStep}
            totalSteps={totalSteps}
          >
            <div className="grid gap-4">
              <OptionCard
                label={t('advisor.step2.oneWeek')}
                value="oneWeek"
                selected={formData.duration === 'oneWeek'}
                onClick={() => handleDurationSelect('oneWeek')}
                icon={<Clock className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step2.twoWeeks')}
                value="twoWeeks"
                selected={formData.duration === 'twoWeeks'}
                onClick={() => handleDurationSelect('twoWeeks')}
                icon={<Clock className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step2.threeWeeks')}
                value="threeWeeks"
                selected={formData.duration === 'threeWeeks'}
                onClick={() => handleDurationSelect('threeWeeks')}
                icon={<Clock className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step2.fourWeeks')}
                value="fourWeeks"
                selected={formData.duration === 'fourWeeks'}
                onClick={() => handleDurationSelect('fourWeeks')}
                icon={<Clock className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step2.flexible')}
                value="flexible"
                selected={formData.duration === 'flexible'}
                onClick={() => handleDurationSelect('flexible')}
                icon={<Clock className="w-5 h-5" />}
              />
            </div>
          </AdvisorStep>
        )}

        {/* Step 3: Budget */}
        {currentStep === 3 && (
          <AdvisorStep
            title={t('advisor.step3.title')}
            subtitle={t('advisor.step3.subtitle')}
            currentStep={currentStep}
            totalSteps={totalSteps}
          >
            <div className="grid gap-4">
              <OptionCard
                label={t('advisor.step3.low')}
                value="low"
                selected={formData.budget === 'low'}
                onClick={() => handleBudgetSelect('low')}
                icon={<DollarSign className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step3.medium')}
                value="medium"
                selected={formData.budget === 'medium'}
                onClick={() => handleBudgetSelect('medium')}
                icon={<DollarSign className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step3.high')}
                value="high"
                selected={formData.budget === 'high'}
                onClick={() => handleBudgetSelect('high')}
                icon={<DollarSign className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step3.veryHigh')}
                value="veryHigh"
                selected={formData.budget === 'veryHigh'}
                onClick={() => handleBudgetSelect('veryHigh')}
                icon={<DollarSign className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step3.unsure')}
                value="unsure"
                selected={formData.budget === 'unsure'}
                onClick={() => handleBudgetSelect('unsure')}
                icon={<DollarSign className="w-5 h-5" />}
              />
            </div>
          </AdvisorStep>
        )}

        {/* Step 4: Language */}
        {currentStep === 4 && (
          <AdvisorStep
            title={t('advisor.step4.title')}
            subtitle={t('advisor.step4.subtitle')}
            currentStep={currentStep}
            totalSteps={totalSteps}
          >
            <div className="grid gap-4">
              <OptionCard
                label={t('advisor.step4.english')}
                value="english"
                selected={formData.language.includes('english')}
                onClick={() => handleLanguageToggle('english')}
                icon={<Globe className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step4.french')}
                value="french"
                selected={formData.language.includes('french')}
                onClick={() => handleLanguageToggle('french')}
                icon={<Globe className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step4.translator')}
                value="translator"
                selected={formData.language.includes('translator')}
                onClick={() => handleLanguageToggle('translator')}
                icon={<Globe className="w-5 h-5" />}
              />
              <OptionCard
                label={t('advisor.step4.noPreference')}
                value="noPreference"
                selected={formData.language.includes('noPreference')}
                onClick={() => handleLanguageToggle('noPreference')}
                icon={<Globe className="w-5 h-5" />}
              />
            </div>
          </AdvisorStep>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('ui.previous')}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white gap-2"
          >
            {currentStep === totalSteps ? t('ui.finish') : t('ui.next')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
