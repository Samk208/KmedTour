'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useTreatmentsQuery } from '@/lib/api/hooks/use-treatments'
import { PatientIntakeStep2 } from '@/lib/schemas/patient-intake'
import { UseFormReturn } from 'react-hook-form'

interface IntakeFormStep2Props {
  form: UseFormReturn<PatientIntakeStep2>
}

export function IntakeFormStep2({ form }: IntakeFormStep2Props) {
  const { register, formState: { errors }, setValue, watch } = form
  const { data: treatments = [] } = useTreatmentsQuery()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--kmed-navy)' }}>
          Medical Information
        </h2>
        <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>
          Help us understand your medical needs so we can find the best clinics for you.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="treatmentType">Treatment Type *</Label>
          <Select onValueChange={(value) => setValue('treatmentType', value)} value={watch('treatmentType')}>
            <SelectTrigger className={errors.treatmentType ? 'border-[var(--error-red)]' : ''}>
              <SelectValue placeholder="Select treatment type" />
            </SelectTrigger>
            <SelectContent>
              {treatments.map((treatment) => (
                <SelectItem key={treatment.id} value={treatment.slug}>
                  {treatment.title}
                </SelectItem>
              ))}
              <SelectItem value="other">Other (please specify in condition)</SelectItem>
            </SelectContent>
          </Select>
          {errors.treatmentType && (
            <p className="text-sm" style={{ color: 'var(--error-red)' }}>
              {errors.treatmentType.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalCondition">Medical Condition / Reason for Treatment *</Label>
          <Textarea
            id="medicalCondition"
            placeholder="Please describe your condition, symptoms, or reason for seeking treatment..."
            rows={5}
            {...register('medicalCondition')}
            className={errors.medicalCondition ? 'border-[var(--error-red)]' : ''}
          />
          {errors.medicalCondition && (
            <p className="text-sm" style={{ color: 'var(--error-red)' }}>
              {errors.medicalCondition.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="previousTreatments">Previous Treatments (Optional)</Label>
          <Textarea
            id="previousTreatments"
            placeholder="Have you tried any treatments before? If yes, please describe..."
            rows={3}
            {...register('previousTreatments')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="urgency">Treatment Urgency *</Label>
          <Select
            onValueChange={(value) => setValue('urgency', value as PatientIntakeStep2['urgency'])}
            value={watch('urgency')}
          >
            <SelectTrigger className={errors.urgency ? 'border-[var(--error-red)]' : ''}>
              <SelectValue placeholder="When do you need treatment?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">Urgent (within 2 weeks)</SelectItem>
              <SelectItem value="within-1-month">Within 1 month</SelectItem>
              <SelectItem value="within-3-months">Within 3 months</SelectItem>
              <SelectItem value="flexible">Flexible / Planning ahead</SelectItem>
            </SelectContent>
          </Select>
          {errors.urgency && (
            <p className="text-sm" style={{ color: 'var(--error-red)' }}>
              {errors.urgency.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasInsurance"
              checked={watch('hasInsurance')}
              onCheckedChange={(checked) => setValue('hasInsurance', checked as boolean)}
            />
            <Label htmlFor="hasInsurance" className="text-sm font-normal cursor-pointer">
              I have health insurance that may cover international treatment
            </Label>
          </div>

          {watch('hasInsurance') && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="insuranceDetails">Insurance Details</Label>
              <Input
                id="insuranceDetails"
                placeholder="Insurance provider and policy details"
                {...register('insuranceDetails')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
