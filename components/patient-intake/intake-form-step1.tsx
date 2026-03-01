'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCountriesQuery } from '@/lib/api/hooks/use-countries'
import { PatientIntakeStep1 } from '@/lib/schemas/patient-intake'
import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface IntakeFormStep1Props {
  form: UseFormReturn<PatientIntakeStep1>
}

export function IntakeFormStep1({ form }: IntakeFormStep1Props) {
  const { t } = useTranslation()
  const { register, formState: { errors }, setValue, watch } = form
  const { data: countries = [] } = useCountriesQuery()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--kmed-navy)' }}>
          {t('patientIntakePage.step1.title') || "Personal Information"}
        </h2>
        <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>
          {t('patientIntakePage.step1.subtitle') || "Let's start with some basic information about you."}
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">{t('patientIntakePage.step1.fullName') || "Full Name *"}</Label>
          <Input
            id="fullName"
            placeholder={t('patientIntakePage.step1.fullNamePlaceholder') || "John Doe"}
            {...register('fullName')}
            className={errors.fullName ? 'border-[var(--error-red)]' : ''}
          />
          {errors.fullName && (
            <p className="text-sm" style={{ color: 'var(--error-red)' }}>
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t('patientIntakePage.step1.email') || "Email Address *"}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t('patientIntakePage.step1.emailPlaceholder') || "john@example.com"}
            {...register('email')}
            className={errors.email ? 'border-[var(--error-red)]' : ''}
          />
          {errors.email && (
            <p className="text-sm" style={{ color: 'var(--error-red)' }}>
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{t('patientIntakePage.step1.phone') || "Phone Number (with country code) *"}</Label>
          <Input
            id="phone"
            type="tel"
            placeholder={t('patientIntakePage.step1.phonePlaceholder') || "+234 123 456 7890"}
            {...register('phone')}
            className={errors.phone ? 'border-[var(--error-red)]' : ''}
          />
          {errors.phone && (
            <p className="text-sm" style={{ color: 'var(--error-red)' }}>
              {errors.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">{t('patientIntakePage.step1.country') || "Country of Residence *"}</Label>
          <Select onValueChange={(value) => setValue('country', value)} value={watch('country')}>
            <SelectTrigger className={errors.country ? 'border-[var(--error-red)]' : ''}>
              <SelectValue placeholder={t('patientIntakePage.step1.countryPlaceholder') || "Select your country"} />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.slug}>
                  {country.flag} {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && (
            <p className="text-sm" style={{ color: 'var(--error-red)' }}>
              {errors.country.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredLanguage">{t('patientIntakePage.step1.language') || "Preferred Language *"}</Label>
          <Select onValueChange={(value) => setValue('preferredLanguage', value as 'en' | 'fr')} value={watch('preferredLanguage')}>
            <SelectTrigger className={errors.preferredLanguage ? 'border-[var(--error-red)]' : ''}>
              <SelectValue placeholder={t('patientIntakePage.step1.languagePlaceholder') || "Select language"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">{t('patientIntakePage.step1.en') || "English"}</SelectItem>
              <SelectItem value="fr">{t('patientIntakePage.step1.fr') || "Français (French)"}</SelectItem>
            </SelectContent>
          </Select>
          {errors.preferredLanguage && (
            <p className="text-sm" style={{ color: 'var(--error-red)' }}>
              {errors.preferredLanguage.message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
