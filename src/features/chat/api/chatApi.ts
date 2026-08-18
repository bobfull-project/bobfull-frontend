import { apiClient } from '@/lib/api/client'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface ChatRoom {
  chatRoomId: number
  reservationId: number
}

export interface ChatMessage {
  messageId: number
  senderMemberId: number
  senderName: string
  content: string
  sentAt: string
}

export interface ChatMessagePage {
  content: ChatMessage[]
  nextCursor: number | null
}

export type ChatReportReason = 'ABUSE' | 'SPAM' | 'PERSONAL_INFORMATION' | 'OTHER'

export interface CreateChatReportInput {
  reason: ChatReportReason
  anchorMessageId: number
  detail?: string
}

export const chatApi = {
  async getRoom(reservationId: number): Promise<ChatRoom> {
    const response = await apiClient.get<ApiResponse<ChatRoom>>(`/reservations/${reservationId}/chat-room`)
    return response.data.data
  },

  async getMessages(chatRoomId: number, cursor?: number): Promise<ChatMessagePage> {
    const response = await apiClient.get<ApiResponse<ChatMessagePage>>(`/chat/rooms/${chatRoomId}/messages`, {
      params: { cursor, size: 30 },
    })
    return response.data.data
  },

  async reportMember(chatRoomId: number, reportedMemberId: number, input: CreateChatReportInput) {
    const response = await apiClient.post<ApiResponse<{ reportId: number }>>(
      `/chat-rooms/${chatRoomId}/members/${reportedMemberId}/reports`, input,
    )
    return response.data.data
  },
}
