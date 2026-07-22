import { apiClient } from '@/lib/api/client'
import { apiConfig } from '@/lib/api/config'
import { reservations } from '@/mocks/data'
import type { Reservation } from '@/types/domain'

export interface CreateReservationInput { restaurantId: number; dateTime: string; capacity: number; note: string }
export interface ReservationRepository { getMine(): Promise<Reservation[]>; create(input: CreateReservationInput): Promise<Reservation>; join(id: number): Promise<Reservation> }

const mockRepository: ReservationRepository = {
  async getMine() { return reservations },
  async create(input) { return { id: Date.now(), restaurantName: '선택한 식당', hostName: '나', joined: 1, status: 'OPEN', ...input } },
  async join(id) { const item = reservations.find((value) => value.id === id); if (!item) throw new Error('예약을 찾을 수 없습니다.'); return { ...item, joined: Math.min(item.capacity, item.joined + 1) } },
}

const httpRepository: ReservationRepository = {
  async getMine() { return (await apiClient.get<Reservation[]>('/reservations/me')).data },
  async create(input) { return (await apiClient.post<Reservation>('/reservations', input)).data },
  async join(id) { return (await apiClient.post<Reservation>(`/reservations/${id}/participants`)).data },
}

export const reservationRepository = apiConfig.useMock ? mockRepository : httpRepository
