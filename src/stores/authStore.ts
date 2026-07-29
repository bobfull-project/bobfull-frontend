import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  userName: string | null
  role: 'member' | 'owner' | null
  setSession: (accessToken: string, userName: string, role: 'member' | 'owner') => void
  setUserName: (userName: string) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(persist((set) => ({
  accessToken: null,
  userName: null,
  role: null,
  setSession: (accessToken, userName, role) => set({ accessToken, userName, role }),
  setUserName: (userName) => set({ userName }),
  clearSession: () => set({ accessToken: null, userName: null, role: null }),
}), {
  name: 'bobfull-auth-session',
}))
