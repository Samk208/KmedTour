export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--soft-grey)' }}>
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--kmed-navy)' }}>
          Privacy Policy
        </h1>
        
        <div className="prose max-w-none space-y-6" style={{ color: 'var(--deep-grey)' }}>
          <p className="text-lg">
            Last updated: January 2025
          </p>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
              1. Information We Collect
            </h2>
            <p className="leading-relaxed mb-4">We collect information you provide directly to us, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal identification information (name, email, phone number)</li>
              <li>Medical information for treatment matching</li>
              <li>Travel and accommodation preferences</li>
              <li>Payment and billing information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
              2. How We Use Your Information
            </h2>
            <p className="leading-relaxed mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Match you with appropriate medical clinics</li>
              <li>Coordinate your medical travel arrangements</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Improve our services and user experience</li>
              <li>Send you updates and important information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
              3. Information Sharing
            </h2>
            <p className="leading-relaxed">
              We share your information only with verified partner clinics for the purpose of providing medical services. We do not sell or rent your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
              4. Data Security
            </h2>
            <p className="leading-relaxed">
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
              5. Your Rights
            </h2>
            <p className="leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
              6. Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at privacy@kmedtour.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
