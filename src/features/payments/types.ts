/** 예약 준비 API(백엔드 #91/#92) 응답으로 PortOne 결제창을 여는 데 필요한 값이다. */
export interface PreparedPayment {
  paymentId: string
  orderName: string
  totalAmount: number
  currency: string
  /** ISO 8601. 이 시각이 지나면 결제 버튼을 비활성화한다. */
  expiresAt: string
}

export type PaymentOutcome =
  | { status: 'SUCCESS' }
  | { status: 'FAILED'; message: string }
  | { status: 'EXPIRED' }
  | { status: 'ALREADY_IN_PROGRESS' }
