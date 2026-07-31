import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { prepareReservationPayment } from '@/features/payments/api/prepareReservationPayment'
import { usePortOnePayment } from '@/features/payments/hooks/usePortOnePayment'
import { portoneConfig } from '@/features/payments/portoneConfig'
import { reservationSchema, type ReservationFormValues } from '@/features/reservations/schemas'
import type { AvailableDiningSession } from '@/features/restaurants/api/sessionApi'
import { formatDateTime } from '@/lib/utils'

interface ReservationFormLocationState {
  /** CREATE: 식당 상세에서 새 회차 예약. JOIN: 모집중 목록에서 기존 예약 참여. */
  type: 'CREATE' | 'JOIN'
  /** CREATE는 sessionId, JOIN은 기존 reservationId. */
  targetId: number
  session: AvailableDiningSession
  restaurantName: string
  depositPerPerson: number
}

function remainingSeconds(expiresAt: string) {
  return Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
}

function formatRemaining(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

export function ReservationFormPage() {
  const restaurantId = Number(useParams().restaurantId)
  const navigate = useNavigate()
  const location = useLocation()
  // 회차 상세 조회 API가 따로 없어서, 식당 상세 페이지에서 고른 회차 정보를 라우터 state로 그대로 전달받는다.
  // 새로고침 등으로 state가 사라지면 식당 상세로 돌려보낸다.
  const state = location.state as ReservationFormLocationState | null
  const { register, handleSubmit, control, formState: { errors } } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { partySize: 1 },
  })
  const partySize = useWatch({ control, name: 'partySize' }) || 1

  const [paymentError, setPaymentError] = useState<string | null>(null)
  const { pay, isProcessing } = usePortOnePayment()

  // partySize가 바뀌면 결제 금액이 바뀌므로 결제 준비를 다시 호출한다.
  const prepareQuery = useQuery({
    queryKey: ['reservation-prepare', state?.type, state?.targetId, partySize],
    queryFn: () => prepareReservationPayment({
      type: state!.type,
      targetId: state!.targetId,
      partySize,
      restaurantName: state!.restaurantName,
    }),
    enabled: !!state && partySize > 0,
  })
  const prepared = prepareQuery.data ?? null

  // 1초마다 리렌더해 남은 결제 유효시간을 표시한다. setState는 인터벌 콜백 안에서만 일어난다.
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [])
  // tick은 함수 본문에서 안 읽지만, 1초마다 이 값을 다시 계산하도록 강제하는 용도다.
  const secondsLeft = useMemo(() => {
    void tick
    return prepared ? remainingSeconds(prepared.expiresAt) : 0
  }, [prepared, tick])

  const isExpired = prepared !== null && secondsLeft <= 0

  const onSubmit = handleSubmit(async () => {
    if (!prepared) return
    setPaymentError(null)
    const outcome = await pay(prepared)
    if (outcome.status === 'SUCCESS') {
      navigate('/reservations')
      return
    }
    if (outcome.status === 'EXPIRED') {
      setPaymentError('결제 유효시간이 지났습니다. 인원수를 다시 선택하거나 새로고침 후 시도해주세요.')
      return
    }
    if (outcome.status === 'ALREADY_IN_PROGRESS') return
    setPaymentError(outcome.message)
  })

  if (!state) return <Navigate to={`/restaurants/${restaurantId}`} replace />
  const { session, restaurantName, depositPerPerson } = state

  return <section className="page-container page-section max-w-3xl">
    <PageHeader eyebrow="RESERVATION" title="예약 정보 확인" description="사장님이 등록한 예약 가능 시간에서 좌석을 예약합니다." />
    <form className="card space-y-6 p-6 md:p-8" onSubmit={onSubmit}>
      <div className="rounded-2xl bg-brand-soft p-5">
        <p className="text-sm font-semibold text-brand">{restaurantName}</p>
        <p className="mt-2 text-lg font-semibold">{formatDateTime(session.startAt)}</p>
        <p className="mt-2 text-sm text-muted">{session.startAt.slice(11, 16)}~{session.endAt.slice(11, 16)}</p>
        <p className="mt-2 text-sm text-muted">잔여 좌석 {session.availableCapacity}석 · 정원 {session.capacity}명</p>
      </div>
      <label className="block">
        <span className="label">예약 인원</span>
        <input type="number" min="1" max={session.availableCapacity} className="field" {...register('partySize', { valueAsNumber: true, max: session.availableCapacity })} />
        <span className="mt-1 block text-xs text-muted">최대 {session.availableCapacity}명까지 예약할 수 있습니다.</span>
        <span className="mt-1 block text-xs text-red-700">{errors.partySize?.message}</span>
      </label>
      <div className="rounded-2xl border border-line p-5">
        <div className="flex items-center justify-between text-sm"><span className="text-muted">1인당 예약금</span><strong>{depositPerPerson.toLocaleString()}원</strong></div>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3"><span className="font-semibold">결제 예정 금액</span><strong className="text-lg text-brand">{(depositPerPerson * partySize).toLocaleString()}원</strong></div>
        {prepareQuery.isLoading && <p className="mt-3 text-xs text-muted">결제 준비 중...</p>}
        {prepared && <p className="mt-3 text-xs text-muted">결제 유효시간: {isExpired ? '만료됨' : formatRemaining(secondsLeft)}</p>}
        {portoneConfig.isDemo && <p className="mt-2 text-xs font-medium text-brand">PortOne 공식 테스트 채널 · 실제 청구되지 않습니다.</p>}
      </div>
      {paymentError && <p className="text-sm text-red-700">{paymentError}</p>}
      {prepareQuery.isError && <p className="text-sm text-red-700">예약 준비에 실패했습니다. 다시 시도해주세요.</p>}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>취소</Button>
        <Button type="submit" disabled={!prepared || isExpired || isProcessing}>
          {isProcessing ? '결제창 여는 중...' : isExpired ? '결제 유효시간 만료' : portoneConfig.isDemo ? 'PortOne 테스트 결제창 열기' : '결제하고 예약하기'}
        </Button>
      </div>
    </form>
  </section>
}
