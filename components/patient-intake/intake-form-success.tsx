'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle, Home, FileText } from 'lucide-react'

interface IntakeFormSuccessProps {
  submissionId: string
}

export function IntakeFormSuccess({ submissionId }: IntakeFormSuccessProps) {
  return (
    <div className="text-center space-y-8 py-12">
      <div className="flex justify-center">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--success-green)' }}
        >
          <CheckCircle className="h-12 w-12 text-white" />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-3xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
          Submission Successful!
        </h2>
        <p className="text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--deep-grey)' }}>
          Thank you for choosing Kmedtour. We&apos;ve received your information and our team will review it shortly.
        </p>
      </div>

      <div className="bg-[var(--soft-grey)] rounded-xl p-6 max-w-md mx-auto">
        <div className="space-y-2">
          <div className="text-sm font-semibold" style={{ color: 'var(--kmed-navy)' }}>
            Your Reference Number:
          </div>
          <div className="text-2xl font-bold" style={{ color: 'var(--kmed-blue)' }}>
            {submissionId}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold" style={{ color: 'var(--kmed-navy)' }}>
          What Happens Next?
        </h3>
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
          <div className="bg-white rounded-lg p-6 border" style={{ borderColor: 'var(--border-grey)' }}>
            <div className="text-lg font-bold mb-2" style={{ color: 'var(--kmed-blue)' }}>
              1. Review
            </div>
            <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>
              Our medical team will review your case within 24-48 hours
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border" style={{ borderColor: 'var(--border-grey)' }}>
            <div className="text-lg font-bold mb-2" style={{ color: 'var(--kmed-blue)' }}>
              2. Matching
            </div>
            <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>
              We&apos;ll match you with 3-5 trusted clinics specialized in your treatment
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 border" style={{ borderColor: 'var(--border-grey)' }}>
            <div className="text-lg font-bold mb-2" style={{ color: 'var(--kmed-blue)' }}>
              3. Contact
            </div>
            <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>
              You&apos;ll receive clinic recommendations via email with next steps
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
        <Link href="/">
          <Button size="lg" variant="outline">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Button>
        </Link>
        <Link href="/content">
          <Button 
            size="lg"
            className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
          >
            <FileText className="mr-2 h-5 w-5" />
            Explore Content Hub
          </Button>
        </Link>
      </div>
    </div>
  )
}
