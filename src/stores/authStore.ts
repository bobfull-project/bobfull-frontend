import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  userName: string | null
  role: 'member' | 'owner' | 'admin' | null
  setSession: (accessToken: string, refreshToken: string, userName: string, role: 'member' | 'owner' | 'admin') => void
  setTokens: (accessToken: string, refreshToken: string) => void
  setUserName: (userName: string) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(persist((set) => ({
  accessToken: null,
  refreshToken: null,
  userName: null,
  role: null,
  setSession: (accessToken, refreshToken, userName, role) => set({ accessToken, refreshToken, userName, role }),
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  setUserName: (userName) => set({ userName }),
  clearSession: () => set({ accessToken: null, refreshToken: null, userName: null, role: null }),
}), {
  name: 'bobfull-auth-session',
}))
