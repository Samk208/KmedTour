'use client'

import { useFavoritesStore } from '@/lib/stores/favorites-store'
import { FavoriteButton } from '@/components/shared/favorite-button'
import { FileText, Heart, Stethoscope, Building2, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function FavoritesPage() {
  const { favorites, clearFavorites, getFavoritesByType } = useFavoritesStore()

  const treatments = getFavoritesByType('treatment')
  const articles = getFavoritesByType('article')
  const clinics = getFavoritesByType('clinic')

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="text-center py-20">
            <div
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: 'var(--soft-grey)' }}
            >
              <Heart className="h-10 w-10" style={{ color: 'var(--kmed-blue)' }} />
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--kmed-navy)' }}>
              No Favorites Yet
            </h1>
            <p className="text-lg mb-8" style={{ color: 'var(--deep-grey)' }}>
              Start exploring treatments, articles, and clinics to save your favorites here.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/content/treatments"
                className="px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: 'var(--kmed-blue)' }}
              >
                Browse Treatments
              </Link>
              <Link
                href="/clinics"
                className="px-6 py-3 rounded-full font-semibold transition-all duration-300 hover:scale-105"
                style={{ 
                  backgroundColor: 'white',
                  color: 'var(--kmed-blue)',
                  border: '2px solid var(--kmed-blue)'
                }}
              >
                Explore Clinics
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto max-w-[1240px] px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--kmed-navy)' }}>
              My Favorites
            </h1>
            <p className="text-lg" style={{ color: 'var(--deep-grey)' }}>
              {favorites.length} saved {favorites.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={clearFavorites}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'white',
                color: 'var(--kmed-blue)',
                border: '2px solid var(--soft-grey)'
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="text-sm font-medium">Clear All</span>
            </button>
          )}
        </div>

        {/* Treatments Section */}
        {treatments.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Stethoscope className="h-6 w-6" style={{ color: 'var(--kmed-blue)' }} />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
                Treatments ({treatments.length})
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {treatments.map((item) => (
                <Link
                  key={item.id}
                  href={`/content/treatments/${item.slug}`}
                  className="block bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold flex-1" style={{ color: 'var(--kmed-navy)' }}>
                      {item.title}
                    </h3>
                    <FavoriteButton item={item} />
                  </div>
                  {item.category && (
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: 'var(--soft-grey)', color: 'var(--kmed-blue)' }}
                    >
                      {item.category}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Clinics Section */}
        {clinics.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Building2 className="h-6 w-6" style={{ color: 'var(--kmed-blue)' }} />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
                Clinics ({clinics.length})
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clinics.map((item) => (
                <div
                  key={item.id}
                  className="block bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold flex-1" style={{ color: 'var(--kmed-navy)' }}>
                      {item.title}
                    </h3>
                    <FavoriteButton item={item} />
                  </div>
                  {item.category && (
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: 'var(--soft-grey)', color: 'var(--kmed-blue)' }}
                    >
                      {item.category}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Articles Section */}
        {articles.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-6 w-6" style={{ color: 'var(--kmed-blue)' }} />
              <h2 className="text-2xl font-bold" style={{ color: 'var(--kmed-navy)' }}>
                Articles ({articles.length})
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((item) => (
                <Link
                  key={item.id}
                  href={`/content/articles/${item.slug}`}
                  className="block bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold flex-1" style={{ color: 'var(--kmed-navy)' }}>
                      {item.title}
                    </h3>
                    <FavoriteButton item={item} />
                  </div>
                  {item.category && (
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: 'var(--soft-grey)', color: 'var(--kmed-blue)' }}
                    >
                      {item.category}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
