'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useContactSubmission } from '@/lib/api/hooks/use-contact'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Please enter your full name'),
  email: z
    .string()
    .min(1, 'Please enter your email')
    .email('Please enter a valid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Please enter a subject'),
  message: z.string().min(1, 'Please enter a message'),
})

type ContactFormValues = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { mutateAsync: submitContact, isPending } = useContactSubmission()

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    },
  })

  const onSubmit = async (values: ContactFormValues) => {
    setErrorMessage(null)

    try {
      const result = await submitContact({
        fullName: values.name,
        email: values.email,
        phone: values.phone ?? '',
        message: `${values.subject}\n\n${values.message}`,
        type: 'patient_contact',
        sourcePage: 'contact',
      })

      if (!result.success) {
        setErrorMessage(result.message ?? 'Something went wrong. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setErrorMessage('We couldn\'t reach the server. Please check your connection and try again.')
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
              form.reset()
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

              {errorMessage && (
                <div
                  className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm"
                  role="alert"
                >
                  {errorMessage}
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+234 123 456 7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject *</FormLabel>
                          <FormControl>
                            <Input placeholder="How can we help?" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message *</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={6}
                            placeholder="Tell us more about your inquiry..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isPending}
                    className="w-full bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
                  >
                    {isPending ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </Form>
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
