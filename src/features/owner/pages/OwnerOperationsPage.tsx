import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { operationsApi, type OperationRow, type OwnerReservationListItem } from '@/features/owner/api/operationsApi'

const Row = ({ row }: { row: OperationRow }) => <div className="rounded-2xl border border-line p-4 text-sm"><div className="grid gap-2 md:grid-cols-3">{Object.entries(row).map(([key, value]) => <p key={key}><span className="text-xs text-muted">{key}</span><br /><strong>{value == null ? '-' : String(value)}</strong></p>)}</div></div>

const requestErrorMessage = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  return '요청을 처리하지 못했습니다.'
}

const formatDateTime = (value: string) => new Date(value).toLocaleString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short', hour: '2-digit', minute: '2-digit' })
const formatMoney = (value: number) => `${Number(value).toLocaleString('ko-KR')}원`
const statusLabel: Record<string, string> = { RECRUITING: '모집 중', CONFIRMED: '예약 확정', CANCELLED: '취소', CLOSED: '종료', OPEN: '모집 중' }

export function OwnerOperationsPage() {
  const restaurantId = Number(useParams().restaurantId)
  const [reservationId, setReservationId] = useState<number | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [now] = useState(() => Date.now())
  const queryClient = useQueryClient()
  const expected = useQuery({ queryKey: ['owner', restaurantId, 'settlement'], queryFn: () => operationsApi.expectedSettlement(restaurantId) })
  const settlements = useQuery({ queryKey: ['owner', restaurantId, 'settlements'], queryFn: () => operationsApi.reservationSettlements(restaurantId) })
  const customers = useQuery({ queryKey: ['owner', restaurantId, 'no-shows'], queryFn: () => operationsApi.noShowCustomers(restaurantId) })
  const reservations = useQuery({ queryKey: ['owner', restaurantId, 'reservations'], queryFn: () => operationsApi.ownerReservations(restaurantId) })
  const selectedReservation = reservations.data?.content.find((reservation) => reservation.reservationId === reservationId)
  const diningEnded = selectedReservation ? now > new Date(selectedReservation.endAt).getTime() : false
  const detail = useQuery({ queryKey: ['owner', 'reservation', reservationId, 'detail'], queryFn: () => operationsApi.reservationDetail(Number(reservationId)), enabled: Number(reservationId) > 0 })
  const participants = useQuery({ queryKey: ['owner', 'reservation', reservationId, 'participants'], queryFn: () => operationsApi.reservationParticipants(Number(reservationId)), enabled: Number(reservationId) > 0 })
  const settlement = useQuery({ queryKey: ['owner', 'reservation', reservationId, 'settlement'], queryFn: () => operationsApi.reservationSettlement(Number(reservationId)), enabled: Number(reservationId) > 0 })
  const candidates = useQuery({ queryKey: ['owner', 'reservation', reservationId, 'candidates'], queryFn: () => operationsApi.noShowCandidates(Number(reservationId)), enabled: Number(reservationId) > 0 && diningEnded })
  const histories = useQuery({ queryKey: ['owner', 'reservation', reservationId, 'no-show-histories'], queryFn: () => operationsApi.noShowHistories(Number(reservationId)), enabled: Number(reservationId) > 0 && diningEnded })
  const mutate = useMutation({
    mutationFn: ({ participationId, marked }: { participationId: number; marked: boolean }) => marked ? operationsApi.unmarkNoShow(Number(reservationId), participationId) : operationsApi.markNoShow(Number(reservationId), participationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner', 'reservation', reservationId] })
      await queryClient.invalidateQueries({ queryKey: ['owner', restaurantId, 'no-shows'] })
    },
  })
  const cancel = useMutation({
    mutationFn: () => operationsApi.cancelReservation(Number(reservationId), cancelReason.trim()),
    onSuccess: async () => {
      setCancelReason('')
      await queryClient.invalidateQueries({ queryKey: ['owner', restaurantId, 'reservations'] })
      await queryClient.invalidateQueries({ queryKey: ['owner', 'reservation', reservationId] })
    },
  })
  const activeNoShows = (histories.data?.content ?? []).filter((history, index, items) =>
    items.findIndex((item) => item.participationId === history.participationId) === index && history.isMarked)
  return <div className="mx-auto max-w-6xl"><header className="mb-8"><p className="text-sm font-semibold text-brand">OWNER OPERATIONS</p><h1 className="mt-2 text-3xl font-semibold">노쇼·지급 예정 관리</h1></header>
    <section className="card p-6"><h2 className="text-xl font-semibold">지급 예정 금액</h2>{expected.data && <Row row={expected.data} />}<div className="mt-4 space-y-3">{settlements.data?.content.map((row, i) => <Row key={i} row={row} />)}</div></section>
    <section className="card mt-6 p-6"><h2 className="text-xl font-semibold">식당 노쇼 고객</h2><div className="mt-4 space-y-3">{customers.data?.content.map((row, i) => <Row key={i} row={row} />)}</div></section>
    <section className="card mt-6 p-6"><h2 className="text-xl font-semibold">예약 상세 관리</h2><p className="mt-2 text-sm text-muted">예약을 선택해 참여자, 결제·환불 내역, 노쇼 처리 상태를 확인할 수 있습니다.</p>
      {reservations.isLoading && <p className="mt-4 text-sm text-muted">예약을 불러오는 중입니다.</p>}
      {reservations.isError && <p className="mt-4 text-sm text-red-700">예약 목록을 불러오지 못했습니다.</p>}
      <div className="mt-4 grid gap-3 md:grid-cols-2">{reservations.data?.content.map((reservation: OwnerReservationListItem) => {
        const selected = reservationId === reservation.reservationId
        return <button key={reservation.reservationId} type="button" className={`rounded-2xl border p-4 text-left transition ${selected ? 'border-brand bg-brand-soft' : 'border-line hover:border-brand'}`} onClick={() => { setReservationId(reservation.reservationId); setCancelReason('') }}>
          <span className="text-xs font-semibold text-brand">예약 #{reservation.reservationId}</span>
          <p className="mt-2 font-semibold">{formatDateTime(reservation.startAt)}</p>
          <p className="mt-1 text-sm text-muted">참여 {reservation.currentParticipantCount}/{reservation.capacity}명 · 잔여 {reservation.availableCapacity}석</p>
        </button>
      })}</div>
      {!reservations.isLoading && reservations.data?.content.length === 0 && <p className="mt-4 text-sm text-muted">등록된 예약이 없습니다.</p>}
      {reservationId && <div className="mt-6 border-t border-line pt-6">
        {(detail.isLoading || participants.isLoading || settlement.isLoading) && <p className="text-sm text-muted">예약 상세를 불러오는 중입니다.</p>}
        {(detail.isError || participants.isError || settlement.isError) && <p className="text-sm text-red-700">예약 상세 일부를 불러오지 못했습니다.</p>}
        {detail.data && <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold text-brand">예약 #{detail.data.reservationId}</p><h3 className="mt-2 text-lg font-semibold">{formatDateTime(detail.data.startAt)}</h3></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${detail.data.reservationStatus === 'CANCELLED' ? 'bg-gray-100 text-gray-600' : 'bg-brand-soft text-brand'}`}>{statusLabel[detail.data.reservationStatus] ?? detail.data.reservationStatus}</span></div>
            <dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-muted">테이블</dt><dd className="mt-1 font-semibold">{detail.data.tableId}번 · {detail.data.capacity}인석</dd></div><div><dt className="text-muted">참여 현황</dt><dd className="mt-1 font-semibold">{detail.data.currentParticipantCount}/{detail.data.capacity}명</dd></div><div><dt className="text-muted">남은 좌석</dt><dd className="mt-1 font-semibold">{detail.data.availableCapacity}석</dd></div><div><dt className="text-muted">모집 상태</dt><dd className="mt-1 font-semibold">{statusLabel[detail.data.recruitmentStatus] ?? detail.data.recruitmentStatus}</dd></div></dl>
            {!['CANCELLED', 'CLOSED'].includes(detail.data.reservationStatus) && <div className="mt-6 border-t border-line pt-5"><label className="text-sm font-semibold" htmlFor="owner-cancel-reason">예약 전체 취소</label><p className="mt-1 text-xs text-muted">참여자 전체 예약이 취소되므로 정확한 사유를 입력해주세요.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><input id="owner-cancel-reason" className="field flex-1" maxLength={255} placeholder="취소 사유" value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} /><Button variant="secondary" disabled={!cancelReason.trim() || cancel.isPending} onClick={() => { if (window.confirm('이 예약을 전체 취소할까요?')) cancel.mutate() }}>{cancel.isPending ? '취소 중' : '예약 취소'}</Button></div>{cancel.isError && <p className="mt-2 text-sm text-red-700">{requestErrorMessage(cancel.error)}</p>}{cancel.isSuccess && <p className="mt-2 text-sm font-semibold text-brand">예약을 취소했습니다.</p>}</div>}
          </div>
          <div className="rounded-2xl border border-line bg-white p-5"><p className="text-sm font-semibold">정산 상세</p>{settlement.data && <><p className="mt-3 text-2xl font-semibold text-brand">{formatMoney(settlement.data.expectedSettlementAmount)}</p><p className="mt-1 text-xs text-muted">지급 예정 금액</p><div className="mt-5 space-y-2 text-sm"><p className="font-semibold">결제 {settlement.data.payments.length}건</p>{settlement.data.payments.map((payment) => <p key={payment.paymentId} className="flex justify-between gap-3 text-muted"><span>{payment.paymentStatus}</span><strong className="text-ink">{formatMoney(payment.amount)}</strong></p>)}<p className="pt-2 font-semibold">환불 {settlement.data.refunds.length}건</p>{settlement.data.refunds.map((refund) => <p key={refund.refundId} className="flex justify-between gap-3 text-muted"><span>{refund.refundStatus}</span><strong className="text-ink">-{formatMoney(refund.amount)}</strong></p>)}</div></>}</div>
        </div>}
        <div className="mt-6"><h3 className="font-semibold">전체 참여자</h3><p className="mt-1 text-sm text-muted">예약에 참여한 회원과 신청 인원을 확인합니다.</p><div className="mt-4 grid gap-3 md:grid-cols-2">{participants.data?.content.map((participant) => <div key={participant.participationId} className="rounded-2xl border border-line bg-white p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{participant.name}</p><span className="rounded-full bg-sub-soft px-2.5 py-1 text-xs font-semibold text-muted">{participant.participationStatus}</span></div><p className="mt-2 text-sm text-muted">신청 {participant.partySize}명 · 회원 #{participant.memberId}</p></div>)}</div>{!participants.isLoading && participants.data?.content.length === 0 && <p className="mt-3 text-sm text-muted">참여자가 없습니다.</p>}</div>
        <div className="mt-7 border-t border-line pt-6"><h3 className="font-semibold">노쇼 처리 대상</h3>
        {!diningEnded && <p className="mt-3 text-sm text-muted">식사 종료 후 노쇼 처리가 가능합니다.</p>}
        {candidates.isLoading && <p className="mt-3 text-sm text-muted">참여자를 불러오는 중입니다.</p>}
        {candidates.isError && <p className="mt-3 text-sm text-red-700">{requestErrorMessage(candidates.error)}</p>}
        <div className="mt-4 space-y-3">{candidates.data?.content.map((row) => <div key={row.participationId} className="rounded-2xl border border-line p-4"><p className="font-semibold">{row.name}</p><p className="mt-1 text-sm text-muted">예약 인원 {row.partySize}명</p><Button className="mt-3" variant="secondary" disabled={mutate.isPending} onClick={() => mutate.mutate({ participationId: row.participationId, marked: false })}>노쇼 처리</Button></div>)}</div>
        {!candidates.isLoading && candidates.data?.content.length === 0 && <p className="mt-3 text-sm text-muted">노쇼 처리 가능한 참여자가 없습니다.</p>}
        {diningEnded && <div className="mt-7 border-t border-line pt-6"><h3 className="font-semibold">노쇼 처리된 참여자</h3>
          {histories.isLoading && <p className="mt-3 text-sm text-muted">노쇼 이력을 불러오는 중입니다.</p>}
          {histories.isError && <p className="mt-3 text-sm text-red-700">{requestErrorMessage(histories.error)}</p>}
          <div className="mt-4 space-y-3">{activeNoShows.map((history) => <div key={history.participationId} className="rounded-2xl border border-red-200 bg-red-50 p-4"><p className="font-semibold">{history.name}</p><p className="mt-1 text-sm text-muted">예약 인원 {history.partySize}명 · {new Date(history.processedAt).toLocaleString('ko-KR')} 처리</p><Button className="mt-3" variant="secondary" disabled={mutate.isPending} onClick={() => mutate.mutate({ participationId: history.participationId, marked: true })}>노쇼 해제</Button></div>)}</div>
          {!histories.isLoading && activeNoShows.length === 0 && <p className="mt-3 text-sm text-muted">현재 노쇼 처리된 참여자가 없습니다.</p>}
        </div>}
        {mutate.isError && <p className="mt-4 text-sm text-red-700">{requestErrorMessage(mutate.error)}</p>}
        </div>
      </div>}
    </section>
  </div>
}
