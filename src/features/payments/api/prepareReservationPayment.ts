import { apiClient } from '@/lib/api/client'
import type { PreparedPayment } from '@/features/payments/types'

interface BackendReservationPrepareResponse {
  paymentId: string
  paymentStatus: string
  amount: number
  expiresAt: string
}

export interface PrepareReservationPaymentInput {
  type: 'CREATE' | 'JOIN'
  /** CREATE는 sessionId(TimeSlot), JOIN은 기존 reservationId를 가리킨다. */
  targetId: number
  partySize: number
  restaurantName: string
}

/** 백엔드 응답(paymentId, amount, expiresAt)에 화면 표시용 orderName·currency를 더해 PortOne 결제창 입력값을 만든다. */
export async function prepareReservationPayment(input: PrepareReservationPaymentInput): Promise<PreparedPayment> {
  const response = await apiClient.post<{ data: BackendReservationPrepareResponse }>('/reservations/prepare', {
    type: input.type,
    targetId: input.targetId,
    partySize: input.partySize,
  })
  const data = response.data.data
  return {
    paymentId: data.paymentId,
    orderName: `${input.restaurantName} 예약금`,
    totalAmount: Number(data.amount),
    currency: 'CURRENCY_KRW',
    expiresAt: data.expiresAt,
  }
}
