import { apiClient } from '@/lib/api/client'
import { apiConfig } from '@/lib/api/config'
import { reservations, reservationSlots, restaurants } from '@/mocks/data'
import type { Reservation } from '@/types/domain'

export interface CreateReservationInput { restaurantId: number; slotId: number; partySize: number; note: string }
export interface ReservationRepository { getMine(): Promise<Reservation[]>; create(input: CreateReservationInput): Promise<Reservation>; join(id: number): Promise<Reservation> }

const mockRepository: ReservationRepository = {
  async getMine() { return reservations },
  async create(input) {
    const slot = reservationSlots.find((item) => item.id === input.slotId && item.restaurantId === input.restaurantId)
    const restaurant = restaurants.find((item) => item.id === input.restaurantId)
    if (!slot || slot.remainingSeats < input.partySize) throw new Error('선택한 시간대의 잔여 좌석을 확인해주세요.')
    return {
      id: Date.now(),
      restaurantId: input.restaurantId,
      restaurantName: restaurant?.name ?? '선택한 식당',
      hostName: '나',
      dateTime: slot.dateTime,
      capacity: slot.tableCapacity,
      joined: input.partySize,
      status: 'CONFIRMED',
      note: input.note,
    }
  },
  async join(id) { const item = reservations.find((value) => value.id === id); if (!item) throw new Error('예약을 찾을 수 없습니다.'); return { ...item, joined: Math.min(item.capacity, item.joined + 1) } },
}

const httpRepository: ReservationRepository = {
  async getMine() { return (await apiClient.get<Reservation[]>('/reservations/me')).data },
  async create(input) { return (await apiClient.post<Reservation>('/reservations', input)).data },
  async join(id) { return (await apiClient.post<Reservation>(`/reservations/${id}/participants`)).data },
}

export const reservationRepository = apiConfig.useMock ? mockRepository : httpRepository
