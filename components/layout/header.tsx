'use client'

import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useSupabaseSession } from '@/lib/hooks/use-supabase-session'
import { Link, usePathname, useRouter } from '@/lib/i18n/routing'
import { useFavoritesStore } from '@/lib/stores/favorites-store'
import { useUIStore } from '@/lib/stores/ui-store'
import { createClient } from '@/lib/supabase/client'
import { Globe, Heart, Menu, X } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

export function Header() {
  const { t, i18n } = useTranslation('common')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const { isMobileMenuOpen, toggleMobileMenu, setMobileMenuOpen } = useUIStore()
  const { user, loading } = useSupabaseSession()
  const { favorites } = useFavoritesStore()

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setMobileMenuOpen(false)
      router.push('/')
      router.refresh()
    } catch {
      toast.error('Failed to sign out. Please try again.')
    }
  }

  const locales = ['en', 'fr', 'ar', 'id', 'vi', 'th', 'ms', 'sw']
  const localeNames: Record<string, string> = {
    en: 'English',
    fr: 'Français',
    ar: 'العربية',
    id: 'Bahasa Indonesia',
    vi: 'Tiếng Việt',
    th: 'ไทย',
    ms: 'Bahasa Melayu',
    sw: 'Kiswahili'
  }

  const changeLanguage = (newLang: string) => {
    i18n.changeLanguage(newLang)
    router.replace(pathname, { locale: newLang })
  }

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/about', label: t('nav.about') },
    { href: '/how-it-works', label: t('nav.howItWorks') },
    { href: '/content', label: t('nav.content') },
    { href: '/treatment-advisor', label: t('nav.treatmentAdvisor') },
    { href: '/clinics', label: 'Clinics' },
    { href: '/for-clinics', label: t('nav.forClinics') },
    { href: '/contact', label: t('nav.contact') },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-primary">
              Kmedtour
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <Link href="/favorites" className="relative">
              <Button variant="ghost" size="sm" className="relative" aria-label="Favorites">
                <Heart className="h-5 w-5 text-primary" aria-hidden="true" />
                {favorites.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full flex items-center justify-center text-xs font-bold text-white"
                  >
                    {favorites.length > 9 ? '9+' : favorites.length}
                  </span>
                )}
              </Button>
            </Link>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  aria-label="Select language"
                >
                  <Globe className="h-4 w-4" aria-hidden="true" />
                  {locale.toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {locales.map((l) => (
                  <DropdownMenuItem
                    key={l}
                    onClick={() => changeLanguage(l)}
                    className={locale === l ? "bg-accent" : ""}
                  >
                    {localeNames[l] || l.toUpperCase()}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {!loading && user ? (
              <>
                <Link href="/patient/dashboard">
                  <Button variant="ghost" size="sm">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || t('nav.dashboard')}
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                {!loading && (
                  <Link href="/patient/login">
                    <Button variant="ghost" size="sm">
                      {t('nav.login', 'Login')}
                    </Button>
                  </Link>
                )}
                <Link href="/patient-intake">
                  <Button
                    size="sm"
                    className="bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
                  >
                    {t('ui.getStarted')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" style={{ color: 'var(--deep-grey)' }} />
            ) : (
              <Menu className="h-6 w-6" style={{ color: 'var(--deep-grey)' }} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/favorites"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Heart className="h-4 w-4" />
                Favorites {favorites.length > 0 && `(${favorites.length})`}
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Theme:</span>
                <ThemeToggle />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex w-full items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary text-left"
                  >
                    <Globe className="h-4 w-4" />
                    {localeNames[locale] || locale.toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {locales.map((l) => (
                    <DropdownMenuItem
                      key={l}
                      onClick={() => changeLanguage(l)}
                      className={locale === l ? "bg-accent" : ""}
                    >
                      {localeNames[l] || l.toUpperCase()}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {!loading && user ? (
                <>
                  <Link href="/patient/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      {user.user_metadata?.full_name || user.email?.split('@')[0] || t('nav.dashboard')}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="w-full justify-start"
                  >
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  {!loading && (
                    <Link href="/patient/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        {t('nav.login', 'Login')}
                      </Button>
                    </Link>
                  )}
                  <Link href="/patient-intake" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      size="sm"
                      className="w-full bg-[var(--kmed-blue)] hover:bg-[var(--kmed-blue)]/90 text-white"
                    >
                      {t('ui.getStarted')}
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
