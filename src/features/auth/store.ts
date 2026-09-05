import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setTokenProvider } from '@/lib/api/client'
import type { AuthenticatedUser } from '@/types/domain'

interface AuthState {
  user: AuthenticatedUser | null
  token: string | null
  setSession: (user: AuthenticatedUser, token: string) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: (user, token) => set({ user, token }),
      clearSession: () => set({ user: null, token: null }),
    }),
    { name: 'my-shop-admin:auth' },
  ),
)

// Client-side auth only — acceptable for this assessment's mock API. See
// README for how session issuance/verification would move server-side
// (signed tokens, httpOnly cookies) in production.
setTokenProvider(() => useAuthStore.getState().token)
