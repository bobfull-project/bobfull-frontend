import { apiClient } from '@/lib/api/client'

export interface AvailableDiningSession {
  sessionId: number
  tableId: number
  capacity: number
  startAt: string
  endAt: string
  availableCapacity: number
  /** 이 회차를 이미 점유한 활성 예약이 없으면 null(=새로 예약 생성 가능). */
  reservationId: number | null
  currentParticipantCount: number
}

export async function getAvailableSessions(
  restaurantId: number,
  date: string,
  partySize?: number,
): Promise<AvailableDiningSession[]> {
  const response = await apiClient.get<{ data: { restaurantId: number; content: AvailableDiningSession[] } }>(
    `/restaurants/${restaurantId}/dining-sessions`, { params: { date, partySize } },
  )
  return response.data.data.content
}
