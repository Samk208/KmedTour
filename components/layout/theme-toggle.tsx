'use client'

import { Moon, Sun } from 'lucide-react'
import { useUIStore } from '@/lib/stores/ui-store'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore()

  // Apply theme class to document root
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="relative"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5" style={{ color: 'var(--deep-grey)' }} />
      ) : (
        <Sun className="h-5 w-5" style={{ color: 'var(--kmed-teal)' }} />
      )}
    </Button>
  )
}
