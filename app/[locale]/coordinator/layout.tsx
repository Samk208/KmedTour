import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coordinator Dashboard - KmedTour',
  description: 'Patient journey management dashboard for KmedTour coordinators',
}

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {children}
      </div>
    </div>
  )
}
