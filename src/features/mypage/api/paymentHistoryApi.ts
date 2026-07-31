import { apiClient } from '@/lib/api/client'

export type PaymentPurpose = 'CREATE' | 'JOIN'
export type PaymentStatus = 'READY' | 'PAID' | 'EXPIRED' | 'FAILED' | 'CANCELLED'
export type RefundStatus = 'REQUESTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export interface PaymentHistoryItem {
  paymentId: string
  reservationId: number
  participationId: number
  paymentPurpose: PaymentPurpose
  partySize: number
  amount: number
  currency: string
  paymentStatus: PaymentStatus
  paidAt: string | null
}

export interface RefundHistoryItem {
  refundId: number
  paymentId: string
  reservationId: number
  amount: number
  refundStatus: RefundStatus
  requestedAt: string | null
  completedAt: string | null
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

export const paymentHistoryApi = {
  async getMyPayments(paymentStatus?: PaymentStatus): Promise<PaymentHistoryItem[]> {
    const response = await apiClient.get<ApiResponse<PageResponse<PaymentHistoryItem>>>(
      '/members/me/payments', { params: { paymentStatus, size: 100 } },
    )
    return response.data.data.content
  },
  async getMyRefunds(refundStatus?: RefundStatus): Promise<RefundHistoryItem[]> {
    const response = await apiClient.get<ApiResponse<PageResponse<RefundHistoryItem>>>(
      '/members/me/refunds', { params: { refundStatus, size: 100 } },
    )
    return response.data.data.content
  },
}
