import type { PaymentCurrency } from '@portone/browser-sdk/v2'
import { useState } from 'react'
import { completePayment } from '@/features/payments/api/paymentApi'
import { assertPortoneConfigured, portoneConfig } from '@/features/payments/portoneConfig'
import type { PaymentOutcome, PreparedPayment } from '@/features/payments/types'
import { apiConfig } from '@/lib/api/config'

export function usePortOnePayment() {
  const [isProcessing, setIsProcessing] = useState(false)

  const pay = async (prepared: PreparedPayment): Promise<PaymentOutcome> => {
    if (isProcessing) return { status: 'ALREADY_IN_PROGRESS' }
    if (new Date(prepared.expiresAt).getTime() <= Date.now()) return { status: 'EXPIRED' }

    setIsProcessing(true)
    try {
      assertPortoneConfigured()
      const { requestPayment } = await import('@portone/browser-sdk/v2')
      const response = await requestPayment({
        storeId: portoneConfig.storeId!,
        channelKey: portoneConfig.channelKey!,
        paymentId: prepared.paymentId,
        orderName: prepared.orderName,
        totalAmount: prepared.totalAmount,
        currency: prepared.currency as PaymentCurrency,
        payMethod: 'CARD',
        customer: {
          fullName: '밥풀 테스트 사용자',
          phoneNumber: '010-0000-1234',
          email: 'test@bobfull.kr',
        },
      })

      // response가 없거나 code가 있으면 실패·취소다. 이 경우 완료 API를 호출하지 않는다.
      if (!response || response.code) {
        return { status: 'FAILED', message: response?.message ?? '결제가 취소되었습니다.' }
      }

      // Mock 결제창 테스트에서는 아직 없는 서버 완료 검증 API를 호출하지 않는다.
      if (!apiConfig.useMock) await completePayment(prepared.paymentId)
      return { status: 'SUCCESS' }
    } catch (error) {
      const message = error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.'
      return { status: 'FAILED', message }
    } finally {
      setIsProcessing(false)
    }
  }

  return { pay, isProcessing }
}
