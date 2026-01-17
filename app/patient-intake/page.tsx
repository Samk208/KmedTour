'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { FormStepIndicator } from '@/components/patient-intake/form-step-indicator'
import { IntakeFormStep1 } from '@/components/patient-intake/intake-form-step1'
import { IntakeFormStep2 } from '@/components/patient-intake/intake-form-step2'
import { IntakeFormStep3 } from '@/components/patient-intake/intake-form-step3'
import { IntakeFormSuccess } from '@/components/patient-intake/intake-form-success'
import {
  patientIntakeStep1Schema,
  patientIntakeStep2Schema,
  patientIntakeStep3Schema,
  PatientIntakeStep1,
  PatientIntakeStep2,
  PatientIntakeStep3,
  FullPatientIntake,
} from '@/lib/schemas/patient-intake'
import { useSubmitPatientIntake } from '@/lib/api/hooks/use-patient-intake'

export default function PatientIntakePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<FullPatientIntake>>({})
  const [submissionId, setSubmissionId] = useState<string | null>(null)

  const { mutate: submitIntake, isPending } = useSubmitPatientIntake()

  const form1 = useForm<PatientIntakeStep1>({
    resolver: zodResolver(patientIntakeStep1Schema),
    defaultValues: formData as PatientIntakeStep1,
  })

  const form2 = useForm<PatientIntakeStep2>({
    resolver: zodResolver(patientIntakeStep2Schema),
    defaultValues: formData as PatientIntakeStep2,
  })

  const form3 = useForm<PatientIntakeStep3>({
    resolver: zodResolver(patientIntakeStep3Schema),
    defaultValues: formData as PatientIntakeStep3,
  })

  const handleStep1Next = form1.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  const handleStep2Next = form2.handleSubmit((data) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setCurrentStep(3)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  const handleStep3Submit = form3.handleSubmit((data) => {
    const fullData = { ...formData, ...data } as FullPatientIntake
    
    submitIntake(fullData, {
      onSuccess: (response) => {
        setSubmissionId(response.submissionId)
        setCurrentStep(4)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },
      onError: (error) => {
        console.error('[v0] Submission error:', error)
        alert('There was an error submitting your form. Please try again.')
      },
    })
  })

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen py-12" style={{ backgroundColor: 'var(--soft-grey)' }}>
      <div className="container mx-auto max-w-4xl px-4 sm:px-6">
        {currentStep < 4 && (
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: 'var(--kmed-navy)' }}>
              Patient Intake Form
            </h1>
            <p className="text-center text-lg" style={{ color: 'var(--deep-grey)' }}>
              Help us understand your needs to find the perfect clinic match
            </p>
          </div>
        )}

        {currentStep < 4 && <FormStepIndicator currentStep={currentStep} />}

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          {currentStep === 1 && (
            <>
              <IntakeFormStep1 form={form1} />
              <div className="flex justify-end pt-8 border-t mt-8" style={{ borderColor: 'var(--border-grey)' }}>
                <Button
                  size="lg"
                  onClick={handleStep1Next}
                  className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
                >
                  Next Step
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <IntakeFormStep2 form={form2} />
              <div className="flex justify-between pt-8 border-t mt-8" style={{ borderColor: 'var(--border-grey)' }}>
                <Button size="lg" variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleStep2Next}
                  className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
                >
                  Next Step
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <IntakeFormStep3 form={form3} />
              <div className="flex justify-between pt-8 border-t mt-8" style={{ borderColor: 'var(--border-grey)' }}>
                <Button size="lg" variant="outline" onClick={handleBack}>
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleStep3Submit}
                  disabled={isPending}
                  className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Application
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {currentStep === 4 && submissionId && (
            <IntakeFormSuccess submissionId={submissionId} />
          )}
        </div>
      </div>
    </div>
  )
}
