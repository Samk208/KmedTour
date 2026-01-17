import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (email: string, password: string, name: string) => Promise<void>
}

// Mock auth store - replace with real Supabase auth later
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (email: string, password: string) => {
        // TODO: Replace with real Supabase auth
        void password
        await new Promise(resolve => setTimeout(resolve, 1000))
        const mockUser = { id: '1', email, name: email.split('@')[0] }
        set({ user: mockUser, isAuthenticated: true })
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
      
      signup: async (email: string, password: string, name: string) => {
        // TODO: Replace with real Supabase auth
        void password
        await new Promise(resolve => setTimeout(resolve, 1000))
        const mockUser = { id: '1', email, name }
        set({ user: mockUser, isAuthenticated: true })
      },
    }),
    {
      name: 'kmedtour-auth',
    }
  )
)
