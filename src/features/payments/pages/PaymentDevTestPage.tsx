import { requestPayment, type PaymentCurrency } from '@portone/browser-sdk/v2'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { completePayment } from '@/features/payments/api/paymentApi'
import { assertPortoneConfigured, portoneConfig } from '@/features/payments/portoneConfig'

type PaymentResult =
  | { status: 'idle' }
  | { status: 'success' }
  | { status: 'failed'; message: string }

type CompleteResult =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; paymentId: string; paymentStatus: string }
  | { status: 'failed'; message: string }

/**
 * 개발자 전용 결제 테스트 페이지. Postman으로 백엔드 예약 준비 API를 호출해 받은
 * 실제 paymentId/amount를 그대로 입력해 PortOne 결제창을 열어 웹훅·완료 API 연동을 검증한다.
 * 라우터/네비게이션 등 기존 화면은 건드리지 않고 /dev/payment-test 경로에만 추가한다.
 */
export function PaymentDevTestPage() {
  const [paymentId, setPaymentId] = useState('')
  const [amount, setAmount] = useState('')
  const [orderName, setOrderName] = useState('밥풀 결제 테스트')
  const [autoComplete, setAutoComplete] = useState(true)

  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<PaymentResult>({ status: 'idle' })
  const [completeResult, setCompleteResult] = useState<CompleteResult>({ status: 'idle' })

  const canSubmit = paymentId.trim().length > 0 && Number(amount) > 0 && !isProcessing

  const runComplete = async (targetPaymentId: string) => {
    setCompleteResult({ status: 'loading' })
    try {
      const data = await completePayment(targetPaymentId)
      setCompleteResult({ status: 'success', paymentId: data.paymentId, paymentStatus: data.paymentStatus })
    } catch (error) {
      const message = error instanceof Error ? error.message : '완료 API 호출 중 오류가 발생했습니다.'
      setCompleteResult({ status: 'failed', message })
    }
  }

  const onOpenPaymentWindow = async () => {
    if (!canSubmit) return
    setIsProcessing(true)
    setPaymentResult({ status: 'idle' })
    setCompleteResult({ status: 'idle' })
    try {
      assertPortoneConfigured()
      const response = await requestPayment({
        storeId: portoneConfig.storeId!,
        channelKey: portoneConfig.channelKey!,
        paymentId: paymentId.trim(),
        orderName: orderName.trim() || '밥풀 결제 테스트',
        totalAmount: Number(amount),
        currency: 'CURRENCY_KRW' as PaymentCurrency,
        payMethod: 'CARD',
        customer: {
          fullName: '밥풀 테스트 사용자',
          phoneNumber: '010-0000-1234',
          email: 'test@bobfull.kr',
        },
      })

      if (!response || response.code) {
        setPaymentResult({ status: 'failed', message: response?.message ?? '결제가 취소되었습니다.' })
        return
      }

      setPaymentResult({ status: 'success' })
      if (autoComplete) await runComplete(paymentId.trim())
    } catch (error) {
      const message = error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.'
      setPaymentResult({ status: 'failed', message })
    } finally {
      setIsProcessing(false)
    }
  }

  const onManualComplete = () => {
    if (!paymentId.trim()) return
    void runComplete(paymentId.trim())
  }

  return <section className="page-container page-section max-w-3xl">
    <PageHeader
      eyebrow="DEV ONLY"
      title="PortOne 결제 수동 테스트"
      description="Postman으로 받은 실제 paymentId/amount를 입력해 PortOne 결제창을 열고, 웹훅·완료 API 연동을 검증합니다."
    />
    <div className="card space-y-6 p-6 md:p-8">
      <div className="rounded-2xl bg-brand-soft p-5 text-sm text-muted">
        <p>storeId: <span className="font-mono">{portoneConfig.storeId ?? '(미설정)'}</span></p>
        <p className="mt-1">channelKey: <span className="font-mono">{portoneConfig.channelKey ?? '(미설정)'}</span></p>
        {portoneConfig.isDemo && <p className="mt-2 text-xs font-medium text-brand">PortOne 공식 테스트 채널 · 실제 청구되지 않습니다.</p>}
      </div>

      <label className="block">
        <span className="label">Payment ID (백엔드 예약 준비 API 응답값)</span>
        <input className="field" value={paymentId} onChange={(event) => setPaymentId(event.target.value)} placeholder="예: PAY-20260730-abc123" />
      </label>
      <label className="block">
        <span className="label">결제 금액 (백엔드 응답값)</span>
        <input className="field" type="number" min="0" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="예: 10000" />
      </label>
      <label className="block">
        <span className="label">주문명 (선택)</span>
        <input className="field" value={orderName} onChange={(event) => setOrderName(event.target.value)} />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={autoComplete} onChange={(event) => setAutoComplete(event.target.checked)} />
        결제 성공 시 완료 API(<span className="font-mono">/payments/{'{paymentId}'}/complete</span>) 자동 호출
      </label>
      <p className="text-xs text-muted">
        웹훅만으로 READY → PAID 전환이 되는지 확인하려면 체크를 해제하세요.
      </p>

      {paymentResult.status === 'success' && <p className="text-sm font-semibold text-brand">PortOne 결제 성공</p>}
      {paymentResult.status === 'failed' && <p className="text-sm text-red-700">결제 실패/취소: {paymentResult.message}</p>}

      <div className="rounded-2xl border border-line p-5 text-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold">완료 API 결과</span>
          <Button type="button" variant="secondary" onClick={onManualComplete} disabled={!paymentId.trim() || completeResult.status === 'loading'}>
            완료 API 수동 호출
          </Button>
        </div>
        {completeResult.status === 'loading' && <p className="mt-2 text-muted">호출 중...</p>}
        {completeResult.status === 'success' && <p className="mt-2 text-brand">paymentId: {completeResult.paymentId} · paymentStatus: {completeResult.paymentStatus}</p>}
        {completeResult.status === 'failed' && <p className="mt-2 text-red-700">{completeResult.message}</p>}
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={onOpenPaymentWindow} disabled={!canSubmit}>
          {isProcessing ? '결제창 여는 중...' : 'PortOne 결제창 열기'}
        </Button>
      </div>
    </div>
  </section>
}
