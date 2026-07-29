import { apiClient } from '@/lib/api/client'

export interface OwnerDiningSession {
  sessionId: number
  tableId: number
  capacity: number
  startAt: string
  endAt: string
}

interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface RegisterSessionInput {
  startAt: string // "yyyy-MM-ddTHH:mm:ss" (Asia/Seoul 벽시계 시각, 오프셋 없음)
  endAt: string
}

export interface RegisterSessionBulkInput {
  dates: string[] // "yyyy-MM-dd"
  startTime: string // "HH:mm"
  endTime: string // "HH:mm"
  intervalMinutes: number
}

export async function getOwnerSessions(restaurantId: number, date?: string): Promise<OwnerDiningSession[]> {
  const response = await apiClient.get<{ data: PageResponse<OwnerDiningSession> }>(
    `/owner/restaurants/${restaurantId}/dining-sessions`, { params: { date, size: 200 } },
  )
  return response.data.data.content
}

export async function registerSession(tableId: number, input: RegisterSessionInput): Promise<number> {
  const response = await apiClient.post<{ data: { sessionId: number } }>(
    `/owner/tables/${tableId}/dining-sessions`, input,
  )
  return response.data.data.sessionId
}

/** 반환값은 { tableId, createdSessionCount } — 회차는 startTime부터 intervalMinutes 단위로 연속 생성되며 endTime을 넘지 않는다. */
export async function registerSessionsBulk(
  tableId: number,
  input: RegisterSessionBulkInput,
): Promise<{ tableId: number; createdSessionCount: number }> {
  const response = await apiClient.post<{ data: { tableId: number; createdSessionCount: number } }>(
    `/owner/tables/${tableId}/dining-sessions/bulk`, input,
  )
  return response.data.data
}

export async function updateSession(sessionId: number, input: RegisterSessionInput): Promise<void> {
  await apiClient.patch(`/owner/dining-sessions/${sessionId}`, input)
}

export async function deleteSession(sessionId: number): Promise<void> {
  await apiClient.delete(`/owner/dining-sessions/${sessionId}`)
}
