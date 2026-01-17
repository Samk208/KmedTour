'use client'

import { UseFormReturn } from 'react-hook-form'
import { PatientIntakeStep3 } from '@/lib/schemas/patient-intake'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface IntakeFormStep3Props {
  form: UseFormReturn<PatientIntakeStep3>
}

export function IntakeFormStep3({ form }: IntakeFormStep3Props) {
  const { register, formState: { errors }, setValue, watch } = form

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--kmed-navy)' }}>
          Travel & Budget
        </h2>
        <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>
          Help us plan your medical journey with budget and travel preferences.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="budget">Budget Range (USD) *</Label>
          <Select
            onValueChange={(value) => setValue('budget', value as PatientIntakeStep3['budget'])}
            value={watch('budget')}
          >
            <SelectTrigger className={errors.budget ? 'border-[var(--error-red)]' : ''}>
              <SelectValue placeholder="Select your budget range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="under-5000">Under $5,000</SelectItem>
              <SelectItem value="5000-10000">$5,000 - $10,000</SelectItem>
              <SelectItem value="10000-20000">$10,000 - $20,000</SelectItem>
              <SelectItem value="over-20000">Over $20,000</SelectItem>
            </SelectContent>
          </Select>
          {errors.budget && (
            <p className="text-sm" style={{ color: 'var(--error-red)' }}>
              {errors.budget.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label>Travel Dates *</Label>
          <RadioGroup
            value={watch('travelDates')}
            onValueChange={(value) => setValue('travelDates', value as 'flexible' | 'specific')}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="flexible" id="flexible" />
              <Label htmlFor="flexible" className="font-normal cursor-pointer">
                Flexible dates
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="specific" id="specific" />
              <Label htmlFor="specific" className="font-normal cursor-pointer">
                I have specific dates in mind
              </Label>
            </div>
          </RadioGroup>
          {errors.travelDates && (
            <p className="text-sm" style={{ color: 'var(--error-red)' }}>
              {errors.travelDates.message}
            </p>
          )}

          {watch('travelDates') === 'specific' && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="specificDates">Preferred Dates</Label>
              <Input
                id="specificDates"
                placeholder="e.g., March 15-30, 2025"
                {...register('specificDates')}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="accommodation">Accommodation Preference *</Label>
          <Select
            onValueChange={(value) => setValue('accommodation', value as PatientIntakeStep3['accommodation'])}
            value={watch('accommodation')}
          >
            <SelectTrigger className={errors.accommodation ? 'border-[var(--error-red)]' : ''}>
              <SelectValue placeholder="How would you like to arrange accommodation?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clinic-arranged">Clinic-arranged accommodation</SelectItem>
              <SelectItem value="self-arranged">I&apos;ll arrange my own accommodation</SelectItem>
              <SelectItem value="need-help">I need help finding accommodation</SelectItem>
            </SelectContent>
          </Select>
          {errors.accommodation && (
            <p className="text-sm" style={{ color: 'var(--error-red)' }}>
              {errors.accommodation.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
          <Textarea
            id="additionalNotes"
            placeholder="Any other information you&apos;d like us to know? Special requirements, dietary restrictions, mobility needs, etc."
            rows={4}
            {...register('additionalNotes')}
          />
        </div>

        <div className="space-y-3 pt-4 border-t" style={{ borderColor: 'var(--border-grey)' }}>
          <div className="flex items-start space-x-2">
            <Checkbox
              id="agreeToTerms"
              checked={watch('agreeToTerms')}
              onCheckedChange={(checked) => setValue('agreeToTerms', checked as boolean)}
              className={errors.agreeToTerms ? 'border-[var(--error-red)]' : ''}
            />
            <Label htmlFor="agreeToTerms" className="text-sm font-normal cursor-pointer leading-relaxed">
              I agree to Kmedtour&apos;s{' '}
              <a href="/terms" className="underline" style={{ color: 'var(--kmed-blue)' }}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="underline" style={{ color: 'var(--kmed-blue)' }}>
                Privacy Policy
              </a>
              . I understand that this is a preliminary assessment and not a guarantee of treatment.
            </Label>
          </div>
          {errors.agreeToTerms && (
            <p className="text-sm ml-6" style={{ color: 'var(--error-red)' }}>
              {errors.agreeToTerms.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
