'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useContactSubmission } from '@/lib/api/hooks/use-contact'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const { mutateAsync: submitContact, isPending } = useContactSubmission()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await submitContact({
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: `${formData.subject}\n\n${formData.message}`,
        type: 'patient_contact',
        sourcePage: 'contact',
      })

      if (!result.success) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('[contact] Submission failed')
        }
        return
      }

      setSubmitted(true)
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[contact] Network error:', err)
      }
    }
  }

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      details: ['info@kmedtour.com', 'support@kmedtour.com'],
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['+82 10 1234 5678', '+234 123 456 7890'],
    },
    {
      icon: MapPin,
      title: 'Office',
      details: ['Seoul, South Korea', 'Lagos, Nigeria'],
    },
    {
      icon: Clock,
      title: 'Hours',
      details: ['Mon-Fri: 9am-6pm KST', '24/7 Emergency Support'],
    },
  ]

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--soft-grey)' }}>
        <Card className="p-12 text-center max-w-md bg-white border-[var(--border-grey)]">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: 'var(--success-green)' }}
          >
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
            Message Sent!
          </h2>
          <p className="text-base mb-8" style={{ color: 'var(--deep-grey)' }}>
            Thank you for contacting us. We&apos;ll get back to you within 24 hours.
          </p>
          <Button 
            onClick={() => {
              setSubmitted(false)
              setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
            }}
            className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
          >
            Send Another Message
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--soft-grey)' }}>
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
            Get in Touch
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--deep-grey)' }}>
            Have questions? We&apos;re here to help. Reach out to our team and we&apos;ll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 md:p-12 bg-white border-[var(--border-grey)]">
              <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--kmed-navy)' }}>
                Send Us a Message
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+234 123 456 7890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us more about your inquiry..."
                  />
                </div>

                <Button 
                  type="submit"
                  size="lg"
                  disabled={isPending}
                  className="w-full bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
                >
                  {isPending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="p-6 bg-white border-[var(--border-grey)]">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: 'var(--kmed-blue)' }}
                  >
                    <info.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                      {info.title}
                    </h3>
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-sm" style={{ color: 'var(--deep-grey)' }}>
                        {detail}
                      </p>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
