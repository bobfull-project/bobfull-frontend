import { apiClient } from '@/lib/api/client'

export interface AvailableDiningSession {
  sessionId: number
  tableId: number
  capacity: number
  startAt: string
  endAt: string
  availableCapacity: number
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
