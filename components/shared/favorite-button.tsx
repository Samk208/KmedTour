'use client'

import { Heart } from 'lucide-react'
import { useFavoritesStore, FavoriteItem } from '@/lib/stores/favorites-store'

interface FavoriteButtonProps {
  item: Omit<FavoriteItem, 'addedAt'>
  className?: string
  showLabel?: boolean
}

export function FavoriteButton({ item, className = '', showLabel = false }: FavoriteButtonProps) {
  const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore()
  const isItemFavorite = isFavorite(item.id)

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isItemFavorite) {
      removeFavorite(item.id)
    } else {
      addFavorite(item)
    }
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-200 ${className}`}
      style={{
        backgroundColor: isItemFavorite ? 'var(--kmed-blue)' : 'white',
        color: isItemFavorite ? 'white' : 'var(--kmed-blue)',
        border: `2px solid ${isItemFavorite ? 'var(--kmed-blue)' : 'var(--soft-grey)'}`,
      }}
      aria-label={isItemFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={`h-4 w-4 transition-all duration-200 ${isItemFavorite ? 'fill-current' : ''}`}
      />
      {showLabel && (
        <span className="text-sm font-medium">
          {isItemFavorite ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  )
}
