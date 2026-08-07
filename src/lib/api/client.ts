import axios from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.DEV ? 'http://localhost:8080/api' : undefined
)

if (!API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is required for production builds.')
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  // 로그인 직후처럼 호출부가 새 토큰을 직접 지정한 경우, 저장된 이전 토큰으로 덮어쓰지 않는다.
  if (token && !config.headers.has('Authorization')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshing: Promise<string> | null = null
apiClient.interceptors.response.use(undefined, async (error) => {
  const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
  const state = useAuthStore.getState()
  const isLoginRequest = original?.url?.endsWith('/auth/login')
  if (!original || error.response?.status !== 401 || original._retried || isLoginRequest || !state.refreshToken) {
    return Promise.reject(error)
  }
  original._retried = true
  refreshing ??= axios.post<{ data: { accessToken: string; refreshToken: string } }>(
    `${apiClient.defaults.baseURL}/auth/reissue`, { refreshToken: state.refreshToken },
  ).then((response) => {
    const tokens = response.data.data
    useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken)
    return tokens.accessToken
  }).finally(() => { refreshing = null })
  try {
    const accessToken = await refreshing
    original.headers.set('Authorization', `Bearer ${accessToken}`)
    return apiClient(original)
  } catch (refreshError) {
    useAuthStore.getState().clearSession()
    return Promise.reject(refreshError)
  }
})
