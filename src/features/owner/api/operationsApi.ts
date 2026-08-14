import { apiClient } from '@/lib/api/client'
type ApiResponse<T> = { success: boolean; message: string; data: T }
type PageResponse<T> = { content: T[]; page: number; size: number; totalElements: number; totalPages: number }
export type OperationRow = Record<string, unknown>
export interface OwnerReservationListItem {
  reservationId: number
  sessionId: number
  tableId: number
  capacity: number
  startAt: string
  endAt: string
  reservationStatus: string
  recruitmentStatus: string
  currentParticipantCount: number
  availableCapacity: number
  confirmationThreshold: number
}
export type OwnerReservationDetail = OwnerReservationListItem & { restaurantId: number }
export interface OwnerReservationParticipant {
  participationId: number
  memberId: number
  name: string
  partySize: number
  participationStatus: string
}
export interface SettlementReservationDetail {
  reservationId: number
  expectedSettlementAmount: number
  payments: Array<{ paymentId: string; paymentStatus: string; amount: number }>
  refunds: Array<{ refundId: number; refundStatus: string; amount: number }>
}
export interface NoShowCandidate {
  participationId: number
  memberId: number
  name: string
  partySize: number
  participationStatus: string
}
export interface NoShowHistory {
  noShowHistoryId: number
  participationId: number
  memberId: number
  name: string
  partySize: number
  isMarked: boolean
  processedByMemberId: number
  processedAt: string
}
const page = async (path: string, params?: Record<string, unknown>) => (await apiClient.get<ApiResponse<PageResponse<OperationRow>>>(path, { params })).data.data
const typedPage = async <T>(path: string, params?: Record<string, unknown>) => (await apiClient.get<ApiResponse<PageResponse<T>>>(path, { params })).data.data

export const operationsApi = {
  expectedSettlement: async (restaurantId: number) => (await apiClient.get<ApiResponse<OperationRow>>(`/owner/restaurants/${restaurantId}/settlements/expected`)).data.data,
  reservationSettlements: (restaurantId: number) => page(`/owner/restaurants/${restaurantId}/settlements/reservations`, { size: 100 }),
  noShowCustomers: (restaurantId: number) => page(`/owner/restaurants/${restaurantId}/no-shows`, { size: 100 }),
  ownerReservations: (restaurantId: number) => typedPage<OwnerReservationListItem>(`/owner/restaurants/${restaurantId}/reservations`, { size: 100 }),
  reservationDetail: async (reservationId: number) => (await apiClient.get<ApiResponse<OwnerReservationDetail>>(`/owner/reservations/${reservationId}`)).data.data,
  reservationParticipants: (reservationId: number) => typedPage<OwnerReservationParticipant>(`/owner/reservations/${reservationId}/participations`, { size: 100 }),
  reservationSettlement: async (reservationId: number) => (await apiClient.get<ApiResponse<SettlementReservationDetail>>(`/owner/settlements/reservations/${reservationId}`)).data.data,
  cancelReservation: async (reservationId: number, reason: string) => (await apiClient.post<ApiResponse<{ reservationId: number }>>(`/owner/reservations/${reservationId}/cancel`, { reason })).data.data,
  noShowCandidates: (reservationId: number) => typedPage<NoShowCandidate>(`/owner/reservations/${reservationId}/participations/no-show-candidates`, { size: 100 }),
  noShowHistories: (reservationId: number) => typedPage<NoShowHistory>(`/owner/reservations/${reservationId}/no-show-histories`, { size: 100 }),
  markNoShow: (reservationId: number, participationId: number) => apiClient.post(`/owner/reservations/${reservationId}/participations/${participationId}/no-show`),
  unmarkNoShow: (reservationId: number, participationId: number) => apiClient.delete(`/owner/reservations/${reservationId}/participations/${participationId}/no-show`),
}
