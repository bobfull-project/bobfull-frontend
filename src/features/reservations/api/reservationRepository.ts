import { apiClient } from '@/lib/api/client'
import { apiConfig } from '@/lib/api/config'
import { reservations, reservationSlots, restaurants } from '@/mocks/data'
import type { ParticipationStatus, RecruitmentStatus, ReservationStatus } from '@/types/domain'
import type { PaymentStatus } from '@/features/mypage/api/paymentHistoryApi'

export interface ReservationSearchParams {
  keyword?: string
  date?: string
  time?: string
  capacity?: number
  minimumRemainingSeats?: number
  page?: number
  size?: number
  sort?: string
}

// 백엔드 응답(GET /members/me/reservations, MyReservationListItemResponse)이 실제로 주는 필드다.
export interface MyReservationListItem {
  reservationId: number
  restaurantId: number
  restaurantName: string
  sessionId: number
  startAt: string
  endAt: string
  reservationStatus: ReservationStatus
  recruitmentStatus: RecruitmentStatus
  participationId: number
  partySize: number
  participationStatus: ParticipationStatus
  paymentStatus: PaymentStatus
}

// GET /members/me/reservations/{reservationId} (MyReservationDetailResponse) — 목록 항목에 paymentId가 추가된다.
export interface MyReservationDetail extends MyReservationListItem {
  paymentId: string | null
}

// 취소가 참여자 한 명에게만 적용됐는지, 예약 전체에 적용됐는지를 나타낸다.
export type CancellationScope = 'PARTICIPATION' | 'RESERVATION'

// POST /reservations/{reservationId}/participations/me/cancel (ReservationCancellationResponse)
export interface ReservationCancellationResult {
  reservationId: number
  participationId: number
  participationStatus: ParticipationStatus
  cancellationScope: CancellationScope
  refundStatus: string
}

// 백엔드 응답(6-3, ReservationSearchResponse)이 실제로 주는 필드다.
export interface RecruitingReservationItem {
  reservationId: number
  restaurantId: number
  restaurantName: string
  sessionId: number
  tableId: number
  capacity: number
  startAt: string
  endAt: string
  reservationStatus: ReservationStatus
  recruitmentStatus: RecruitmentStatus
  currentParticipantCount: number
  availableCapacity: number
  confirmationThreshold: number
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ReservationRepository {
  getMine(reservationStatus?: ReservationStatus): Promise<MyReservationListItem[]>
  getDetail(reservationId: number): Promise<MyReservationDetail>
  cancelMyParticipation(reservationId: number, reason: string): Promise<ReservationCancellationResult>
  searchRecruiting(params?: ReservationSearchParams): Promise<RecruitingReservationItem[]>
}

function toRecruitingReservationItem(slot: (typeof reservationSlots)[number]): RecruitingReservationItem {
  const restaurant = restaurants.find((item) => item.id === slot.restaurantId)
  return {
    reservationId: slot.id,
    restaurantId: slot.restaurantId,
    restaurantName: restaurant?.name ?? '알 수 없는 식당',
    sessionId: slot.id,
    tableId: slot.tableId,
    capacity: slot.tableCapacity,
    startAt: slot.startAt,
    endAt: slot.endAt,
    reservationStatus: slot.status === 'FULL' || slot.status === 'CLOSED' ? 'CONFIRMED' : 'RECRUITING',
    recruitmentStatus: slot.remainingSeats > 0 ? 'OPEN' : 'CLOSED',
    currentParticipantCount: slot.currentParticipants,
    availableCapacity: slot.remainingSeats,
    confirmationThreshold: slot.tableCapacity === 2 ? 2 : slot.tableCapacity - 1,
  }
}

function toMyReservationListItem(mock: (typeof reservations)[number]): MyReservationListItem {
  return {
    reservationId: mock.id,
    restaurantId: mock.restaurantId,
    restaurantName: mock.restaurantName,
    sessionId: mock.id,
    startAt: mock.dateTime,
    endAt: mock.dateTime,
    reservationStatus: mock.status,
    recruitmentStatus: mock.recruitmentStatus,
    participationId: mock.id,
    partySize: 1,
    participationStatus: 'RESERVED',
    paymentStatus: 'PAID',
  }
}

const mockRepository: ReservationRepository = {
  async getMine(reservationStatus) {
    const items = reservations.map(toMyReservationListItem)
    return reservationStatus ? items.filter((item) => item.reservationStatus === reservationStatus) : items
  },
  async getDetail(reservationId) {
    const item = reservations.map(toMyReservationListItem).find((mine) => mine.reservationId === reservationId)
    if (!item) throw new Error('예약을 찾을 수 없습니다.')
    return { ...item, paymentId: `mock-payment-${reservationId}` }
  },
  async cancelMyParticipation(reservationId) {
    return {
      reservationId,
      participationId: reservationId,
      participationStatus: 'CANCELLED',
      cancellationScope: 'PARTICIPATION',
      refundStatus: 'REQUESTED',
    }
  },
  async searchRecruiting() {
    return reservationSlots.filter((slot) => slot.remainingSeats > 0).map(toRecruitingReservationItem)
  },
}

const httpRepository: ReservationRepository = {
  async getMine(reservationStatus) {
    const response = await apiClient.get<ApiResponse<PageResponse<MyReservationListItem>>>(
      '/members/me/reservations', { params: { reservationStatus, size: 100 } },
    )
    return response.data.data.content
  },
  async getDetail(reservationId) {
    const response = await apiClient.get<ApiResponse<MyReservationDetail>>(`/members/me/reservations/${reservationId}`)
    return response.data.data
  },
  async cancelMyParticipation(reservationId, reason) {
    const response = await apiClient.post<ApiResponse<ReservationCancellationResult>>(
      `/reservations/${reservationId}/participations/me/cancel`, { reason },
    )
    return response.data.data
  },
  async searchRecruiting(params) {
    const response = await apiClient.get<{ data: { content: RecruitingReservationItem[] } }>(
      '/reservations/search', { params },
    )
    return response.data.data.content
  },
}

export const reservationRepository = apiConfig.useMock ? mockRepository : httpRepository
