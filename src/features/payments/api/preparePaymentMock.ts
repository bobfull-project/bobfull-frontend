import type { PreparedPayment } from '@/features/payments/types'

const READY_EXPIRATION_MS = 10 * 60 * 1000

/**
 * TEMP: 백엔드 예약 준비 API(#92 PortOne 결제 조회·검증 API와 병행 진행 중)가 아직 없어
 * 클라이언트에서 값을 임시로 만든다. 실제 연동 시 이 함수 호출부를 백엔드 응답으로 교체해야 한다.
 * 프론트는 금액·paymentId를 새로 만들지 않는다는 원칙은 이 임시 구현에는 적용되지 않으며,
 * 백엔드 API가 준비되면 이 파일은 삭제한다.
 */
export function prepareReservationPaymentMock(input: {
  restaurantName: string
  depositPerPerson: number
  partySize: number
}): PreparedPayment {
  const now = Date.now()
  return {
    paymentId: `PAY-${now}-${Math.random().toString(36).slice(2, 8)}`,
    orderName: `${input.restaurantName} 예약금`,
    totalAmount: input.depositPerPerson * input.partySize,
    currency: 'CURRENCY_KRW',
    expiresAt: new Date(now + READY_EXPIRATION_MS).toISOString(),
  }
}
