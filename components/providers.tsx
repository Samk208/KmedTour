'use client'

import { I18nextProvider } from 'react-i18next'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import i18n from '@/lib/i18n/config'
import { useState } from 'react'
import { ChatbotWidget } from '@/components/chat/chatbot-widget'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        {children}
        <Toaster
          position="bottom-center"
          richColors
          closeButton
          toastOptions={{
            duration: 5000,
          }}
        />
        <ChatbotWidget />
      </I18nextProvider>
    </QueryClientProvider>
  )
}
