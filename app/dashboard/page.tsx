'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/lib/stores/auth-store'
import { FileText, Calendar, MessageSquare, Settings } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--soft-grey)' }}>
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--kmed-navy)' }}>
            Welcome back, {user?.name}!
          </h1>
          <p className="text-lg" style={{ color: 'var(--deep-grey)' }}>
            Manage your medical journey and track your progress
          </p>
        </div>

        <div 
          className="rounded-2xl p-12 text-center mb-12"
          style={{ backgroundColor: 'var(--kmed-blue)' }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Dashboard Coming Soon
          </h2>
          <p className="text-lg text-white/90 max-w-2xl mx-auto mb-6">
            Your personalized dashboard is currently under development. Soon you&apos;ll be able to track your applications, view clinic matches, and communicate with your medical coordinator.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FileText, title: 'Applications', description: 'View your intake forms' },
            { icon: Calendar, title: 'Appointments', description: 'Manage your bookings' },
            { icon: MessageSquare, title: 'Messages', description: 'Chat with coordinators' },
            { icon: Settings, title: 'Settings', description: 'Update your profile' },
          ].map((item, index) => (
            <Card key={index} className="p-6 bg-white border-[var(--border-grey)] opacity-50">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'var(--soft-grey)' }}
              >
                <item.icon className="h-6 w-6" style={{ color: 'var(--kmed-blue)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--kmed-navy)' }}>
                {item.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--deep-grey)' }}>
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
