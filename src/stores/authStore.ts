import { create } from 'zustand'

interface AuthState {
  accessToken: string | null
  userName: string | null
  role: 'member' | 'owner' | null
  setSession: (accessToken: string, userName: string, role: 'member' | 'owner') => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  userName: null,
  role: null,
  setSession: (accessToken, userName, role) => set({ accessToken, userName, role }),
  clearSession: () => set({ accessToken: null, userName: null, role: null }),
}))
