import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient as createSupabaseClient } from '@/lib/supabase/client'

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
  /** Call once on login to merge localStorage favorites into Supabase */
  syncToSupabase: (userId: string) => Promise<void>
  /** Call once on login to pull Supabase favorites into localStorage */
  loadFromSupabase: (userId: string) => Promise<void>
}

function getSupabase() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return null
  try {
    return createSupabaseClient()
  } catch {
    return null
  }
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
        set((state) => ({ favorites: [...state.favorites, newFavorite] }))

        // Optimistically write to Supabase if possible
        const supabase = getSupabase()
        if (!supabase) return
        supabase.auth.getUser().then(({ data }) => {
          if (!data.user) return
          supabase.from('user_favorites').upsert({
            user_id: data.user.id,
            item_id: item.id,
            item_type: item.type,
            item_title: item.title,
            item_slug: item.slug,
            item_category: item.category ?? null,
          }, { onConflict: 'user_id,item_id' })
        })
      },

      removeFavorite: (id) => {
        set((state) => ({ favorites: state.favorites.filter((f) => f.id !== id) }))

        const supabase = getSupabase()
        if (!supabase) return
        supabase.auth.getUser().then(({ data }) => {
          if (!data.user) return
          supabase.from('user_favorites').delete().match({ user_id: data.user.id, item_id: id })
        })
      },

      isFavorite: (id) => get().favorites.some((f) => f.id === id),

      getFavoritesByType: (type) => get().favorites.filter((f) => f.type === type),

      clearFavorites: () => set({ favorites: [] }),

      syncToSupabase: async (userId) => {
        const supabase = getSupabase()
        if (!supabase) return
        const local = get().favorites
        if (local.length === 0) return

        await supabase.from('user_favorites').upsert(
          local.map((f) => ({
            user_id: userId,
            item_id: f.id,
            item_type: f.type,
            item_title: f.title,
            item_slug: f.slug,
            item_category: f.category ?? null,
          })),
          { onConflict: 'user_id,item_id' }
        )
      },

      loadFromSupabase: async (userId) => {
        const supabase = getSupabase()
        if (!supabase) return

        const { data } = await supabase
          .from('user_favorites')
          .select('item_id, item_type, item_title, item_slug, item_category, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (!data || data.length === 0) return

        const remote: FavoriteItem[] = data.map((row: {
          item_id: string
          item_type: string
          item_title: string
          item_slug: string
          item_category: string | null
          created_at: string
        }) => ({
          id: row.item_id,
          type: row.item_type as FavoriteItem['type'],
          title: row.item_title,
          slug: row.item_slug,
          category: row.item_category ?? undefined,
          addedAt: row.created_at,
        }))

        // Merge: remote wins for duplicates
        const local = get().favorites
        const remoteIds = new Set(remote.map((f) => f.id))
        const merged = [
          ...remote,
          ...local.filter((f) => !remoteIds.has(f.id)),
        ]

        set({ favorites: merged })
      },
    }),
    {
      name: 'kmedtour-favorites',
    }
  )
)
