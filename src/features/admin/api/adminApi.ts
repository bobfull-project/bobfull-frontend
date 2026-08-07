import { apiClient } from '@/lib/api/client'

export interface PageResponse<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number }
type ApiResponse<T> = { success: boolean; message: string; data: T }
export type AdminRow = Record<string, unknown>

const page = async (path: string, params?: Record<string, unknown>) =>
  (await apiClient.get<ApiResponse<PageResponse<AdminRow>>>(path, { params })).data.data

export const adminApi = {
  overview: async () => (await apiClient.get<ApiResponse<AdminRow>>('/admin/statistics/overview')).data.data,
  members: (params?: Record<string, unknown>) => page('/admin/members', params),
  restaurants: (params?: Record<string, unknown>) => page('/admin/restaurants', params),
  reservations: (params?: Record<string, unknown>) => page('/admin/reservations', params),
  payments: (params?: Record<string, unknown>) => page('/admin/payments', params),
  refunds: (params?: Record<string, unknown>) => page('/admin/refunds', params),
  noShows: (params?: Record<string, unknown>) => page('/admin/no-shows', params),
  restaurantStats: (params?: Record<string, unknown>) => page('/admin/statistics/restaurants', params),
  memberNoShowRates: (params?: Record<string, unknown>) => page('/admin/statistics/members/no-show-rates', params),
}
