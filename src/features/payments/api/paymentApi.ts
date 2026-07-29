import { apiClient } from '@/lib/api/client'

interface CompletePaymentResponse {
  paymentId: string
  paymentStatus: string
}

/**
 * 결제 성공 후에만 호출한다(실패·취소 시 호출 금지).
 * 백엔드 #92(PortOne 결제 조회·검증 및 완료 API) 완료 전까지는 404가 정상이다.
 */
export async function completePayment(paymentId: string): Promise<CompletePaymentResponse> {
  const response = await apiClient.post<{ data: CompletePaymentResponse }>(`/payments/${paymentId}/complete`)
  return response.data.data
}
