import { apiClient } from '@/lib/api/client'
import { apiConfig } from '@/lib/api/config'
import { reservations, reservationSlots, restaurants } from '@/mocks/data'
import type { RecruitmentStatus, Reservation, ReservationStatus } from '@/types/domain'

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

export interface ReservationRepository {
  getMine(): Promise<Reservation[]>
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

const mockRepository: ReservationRepository = {
  async getMine() { return reservations },
  async searchRecruiting() {
    return reservationSlots.filter((slot) => slot.remainingSeats > 0).map(toRecruitingReservationItem)
  },
}

const httpRepository: ReservationRepository = {
  async getMine() { return (await apiClient.get<Reservation[]>('/reservations/me')).data },
  async searchRecruiting(params) {
    const response = await apiClient.get<{ data: { content: RecruitingReservationItem[] } }>(
      '/reservations/search', { params },
    )
    return response.data.data.content
  },
}

export const reservationRepository = apiConfig.useMock ? mockRepository : httpRepository
