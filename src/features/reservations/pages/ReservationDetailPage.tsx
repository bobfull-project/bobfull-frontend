import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, CreditCard, MessageCircle, Users } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { reservationRepository } from '@/features/reservations/api/reservationRepository'
import { reservationStatusClass, reservationStatusLabel } from '@/features/reservations/labels'
import { formatDateTime } from '@/lib/utils'
import type { PaymentStatus } from '@/features/mypage/api/paymentHistoryApi'
import type { ParticipationStatus } from '@/types/domain'

const paymentStatusLabel: Record<PaymentStatus, string> = {
  READY: '결제 대기',
  PAID: '결제 완료',
  EXPIRED: '만료됨',
  FAILED: '결제 실패',
  CANCELLED: '취소됨',
  REFUNDED: '환불 완료',
}

const participationStatusLabel: Record<ParticipationStatus, string> = {
  RESERVED: '참여 확정',
  NO_SHOW: '노쇼',
  CANCELLED: '참여 취소',
}

function apiErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  return '예약 취소에 실패했습니다. 잠시 후 다시 시도해주세요.'
}

export function ReservationDetailPage() {
  const reservationId = Number(useParams().reservationId)
  const queryClient = useQueryClient()
  const [cancelling, setCancelling] = useState(false)
  const [reason, setReason] = useState('')
  const [cancelledResult, setCancelledResult] = useState<{ scope: 'PARTICIPATION' | 'RESERVATION' } | null>(null)

  const { data: reservation, isLoading, isError } = useQuery({
    queryKey: ['reservations', 'me', reservationId],
    queryFn: () => reservationRepository.getDetail(reservationId),
    enabled: Number.isFinite(reservationId),
  })

  const cancelMutation = useMutation({
    mutationFn: (cancelReason: string) => reservationRepository.cancelMyParticipation(reservationId, cancelReason),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ['reservations', 'me'] })
      setCancelling(false)
      setCancelledResult({ scope: result.cancellationScope })
    },
  })

  if (isLoading) return <div className="page-container page-section text-center text-sm text-muted">예약 정보를 불러오는 중입니다.</div>
  if (isError || !reservation) return <div className="page-container page-section text-center">
    <h1 className="text-2xl font-semibold">예약을 찾을 수 없습니다</h1>
    <Link to="/reservations"><Button className="mt-6">내 예약으로</Button></Link>
  </div>

  const canCancel = reservation.participationStatus === 'RESERVED'
    && reservation.reservationStatus !== 'CANCELLED' && reservation.reservationStatus !== 'CLOSED'
  const canAccessChat = reservation.participationStatus !== 'CANCELLED'
    && reservation.paymentStatus === 'PAID'

  return <section className="page-container page-section max-w-3xl">
    <PageHeader eyebrow="MY RESERVATIONS" title={reservation.restaurantName} description="내 예약의 상세 정보와 결제 상태를 확인할 수 있습니다." />

    <div className="card p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${reservationStatusClass[reservation.reservationStatus]}`}>{reservationStatusLabel[reservation.reservationStatus]}</span>
        {reservation.reservationStatus !== 'CLOSED' && reservation.reservationStatus !== 'CANCELLED' && <span className="rounded-full bg-sub-soft px-3 py-1 text-xs font-semibold text-brand">모집 {reservation.recruitmentStatus === 'OPEN' ? '중' : '마감'}</span>}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <p className="flex items-center gap-2 text-sm text-muted"><CalendarDays size={16} />{formatDateTime(reservation.startAt)} ~ {reservation.endAt.slice(11, 16)}</p>
        <p className="flex items-center gap-2 text-sm text-muted"><Users size={16} />내 인원 {reservation.partySize}명 · {participationStatusLabel[reservation.participationStatus]}</p>
      </div>

      <div className="mt-6 rounded-2xl border border-line p-5">
        <p className="flex items-center gap-2 text-sm font-semibold"><CreditCard size={16} className="text-brand" />결제 정보</p>
        <p className="mt-3 text-sm text-muted">상태 {paymentStatusLabel[reservation.paymentStatus]}</p>
        {reservation.paymentId && <p className="mt-1 text-sm text-muted">결제 ID {reservation.paymentId}</p>}
      </div>

      <div className="mt-6 flex flex-wrap gap-3"><Link to="/mypage/payments"><Button variant="secondary">결제·환불 내역 보기</Button></Link>{canAccessChat && <Link to={`/reservations/${reservationId}/chat`}><Button className="gap-2"><MessageCircle size={16} />참여자 채팅</Button></Link>}</div>

      {cancelledResult && <p className="mt-6 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
        {cancelledResult.scope === 'RESERVATION' ? '최초 예약자로서 예약 전체가 취소되었습니다.' : '참여가 취소되었습니다.'} 환불은 곧 처리됩니다.
      </p>}

      {canCancel && !cancelledResult && <div className="mt-6 border-t border-line pt-6">
        {!cancelling
          ? <Button variant="secondary" className="text-red-700" onClick={() => setCancelling(true)}>예약 참여 취소</Button>
          : <div>
            <label className="block"><span className="label">취소 사유</span>
              <textarea
                className="field h-24"
                placeholder="취소 사유를 입력해주세요."
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            {cancelMutation.isError && <p className="mt-2 text-sm text-red-700">{apiErrorMessage(cancelMutation.error)}</p>}
            <div className="mt-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => { setCancelling(false); setReason('') }} disabled={cancelMutation.isPending}>돌아가기</Button>
              <Button
                type="button"
                className="bg-red-700 hover:bg-red-800"
                disabled={cancelMutation.isPending || reason.trim().length === 0}
                onClick={() => cancelMutation.mutate(reason.trim())}
              >
                {cancelMutation.isPending ? '취소 처리 중...' : '취소 확정'}
              </Button>
            </div>
          </div>}
      </div>}
    </div>
  </section>
}
