import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface FavoriteItem {
  id: string
  type: 'treatment' | 'article' | 'clinic'
  title: string
  slug: string
  category?: string
  addedAt: string
}

interface FavoritesState {
  favorites: FavoriteItem[]
  addFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  getFavoritesByType: (type: FavoriteItem['type']) => FavoriteItem[]
  clearFavorites: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (item) => {
        const newFavorite: FavoriteItem = {
          ...item,
          addedAt: new Date().toISOString(),
        }
        set((state) => ({
          favorites: [...state.favorites, newFavorite],
        }))
      },
      
      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((fav) => fav.id !== id),
        }))
      },
      
      isFavorite: (id) => {
        return get().favorites.some((fav) => fav.id === id)
      },
      
      getFavoritesByType: (type) => {
        return get().favorites.filter((fav) => fav.type === type)
      },
      
      clearFavorites: () => {
        set({ favorites: [] })
      },
    }),
    {
      name: 'kmedtour-favorites',
    }
  )
)
