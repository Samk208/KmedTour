export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--soft-grey)' }}>
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--kmed-navy)' }}>
          Terms of Service
        </h1>
        
        <div className="prose max-w-none space-y-6" style={{ color: 'var(--deep-grey)' }}>
          <p className="text-lg">
            Last updated: January 2025
          </p>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
              1. Acceptance of Terms
            </h2>
            <p className="leading-relaxed">
              By accessing and using Kmedtour&apos;s services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
              2. Service Description
            </h2>
            <p className="leading-relaxed">
              Kmedtour is a medical tourism facilitation platform connecting patients with verified medical clinics in Korea. We provide information, coordination, and support services but do not provide medical advice or treatment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
              3. User Responsibilities
            </h2>
            <p className="leading-relaxed mb-4">Users agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Make informed decisions about medical treatments</li>
              <li>Consult with qualified medical professionals</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
              4. Medical Disclaimer
            </h2>
            <p className="leading-relaxed">
              Kmedtour is not a healthcare provider and does not provide medical advice, diagnosis, or treatment. All medical decisions should be made in consultation with qualified healthcare professionals.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
              5. Privacy
            </h2>
            <p className="leading-relaxed">
              Your use of our services is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
              6. Contact
            </h2>
            <p className="leading-relaxed">
              For questions about these Terms of Service, please contact us at legal@kmedtour.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
