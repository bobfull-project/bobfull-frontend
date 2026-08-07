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
  return '노쇼 처리 대상을 불러오지 못했습니다.'
}

export function OwnerOperationsPage() {
  const restaurantId = Number(useParams().restaurantId)
  const [reservationId, setReservationId] = useState<number | null>(null)
  const [now] = useState(() => Date.now())
  const queryClient = useQueryClient()
  const expected = useQuery({ queryKey: ['owner', restaurantId, 'settlement'], queryFn: () => operationsApi.expectedSettlement(restaurantId) })
  const settlements = useQuery({ queryKey: ['owner', restaurantId, 'settlements'], queryFn: () => operationsApi.reservationSettlements(restaurantId) })
  const customers = useQuery({ queryKey: ['owner', restaurantId, 'no-shows'], queryFn: () => operationsApi.noShowCustomers(restaurantId) })
  const reservations = useQuery({ queryKey: ['owner', restaurantId, 'reservations'], queryFn: () => operationsApi.ownerReservations(restaurantId) })
  const candidates = useQuery({ queryKey: ['owner', 'reservation', reservationId, 'candidates'], queryFn: () => operationsApi.noShowCandidates(Number(reservationId)), enabled: Number(reservationId) > 0 })
  const histories = useQuery({ queryKey: ['owner', 'reservation', reservationId, 'no-show-histories'], queryFn: () => operationsApi.noShowHistories(Number(reservationId)), enabled: Number(reservationId) > 0 })
  const mutate = useMutation({
    mutationFn: ({ participationId, marked }: { participationId: number; marked: boolean }) => marked ? operationsApi.unmarkNoShow(Number(reservationId), participationId) : operationsApi.markNoShow(Number(reservationId), participationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner', 'reservation', reservationId] })
      await queryClient.invalidateQueries({ queryKey: ['owner', restaurantId, 'no-shows'] })
    },
  })
  const activeNoShows = (histories.data?.content ?? []).filter((history, index, items) =>
    items.findIndex((item) => item.participationId === history.participationId) === index && history.isMarked)
  return <div className="mx-auto max-w-6xl"><header className="mb-8"><p className="text-sm font-semibold text-brand">OWNER OPERATIONS</p><h1 className="mt-2 text-3xl font-semibold">노쇼·지급 예정 관리</h1></header>
    <section className="card p-6"><h2 className="text-xl font-semibold">지급 예정 금액</h2>{expected.data && <Row row={expected.data} />}<div className="mt-4 space-y-3">{settlements.data?.content.map((row, i) => <Row key={i} row={row} />)}</div></section>
    <section className="card mt-6 p-6"><h2 className="text-xl font-semibold">식당 노쇼 고객</h2><div className="mt-4 space-y-3">{customers.data?.content.map((row, i) => <Row key={i} row={row} />)}</div></section>
    <section className="card mt-6 p-6"><h2 className="text-xl font-semibold">예약별 노쇼 처리</h2><p className="mt-2 text-sm text-muted">예약을 선택하면 노쇼 처리 가능한 참여자를 확인할 수 있습니다.</p>
      {reservations.isLoading && <p className="mt-4 text-sm text-muted">예약을 불러오는 중입니다.</p>}
      {reservations.isError && <p className="mt-4 text-sm text-red-700">예약 목록을 불러오지 못했습니다.</p>}
      <div className="mt-4 grid gap-3 md:grid-cols-2">{reservations.data?.content.map((reservation: OwnerReservationListItem) => {
        const selected = reservationId === reservation.reservationId
        const diningEnded = now > new Date(reservation.endAt).getTime()
        return <button key={reservation.reservationId} type="button" disabled={!diningEnded} className={`rounded-2xl border p-4 text-left transition ${selected ? 'border-brand bg-brand-soft' : diningEnded ? 'border-line hover:border-brand' : 'cursor-not-allowed border-line bg-sub-soft opacity-60'}`} onClick={() => setReservationId(reservation.reservationId)}>
          <span className="text-xs font-semibold text-brand">예약 #{reservation.reservationId}</span>
          <p className="mt-2 font-semibold">{new Date(reservation.startAt).toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
          <p className="mt-1 text-sm text-muted">참여 {reservation.currentParticipantCount}/{reservation.capacity}명 · 잔여 {reservation.availableCapacity}석</p>
          {!diningEnded && <p className="mt-2 text-xs font-semibold text-muted">식사 종료 후 노쇼 처리가 가능합니다.</p>}
        </button>
      })}</div>
      {!reservations.isLoading && reservations.data?.content.length === 0 && <p className="mt-4 text-sm text-muted">등록된 예약이 없습니다.</p>}
      {reservationId && <div className="mt-6 border-t border-line pt-6"><h3 className="font-semibold">노쇼 처리 대상</h3>
        {candidates.isLoading && <p className="mt-3 text-sm text-muted">참여자를 불러오는 중입니다.</p>}
        {candidates.isError && <p className="mt-3 text-sm text-red-700">{requestErrorMessage(candidates.error)}</p>}
        <div className="mt-4 space-y-3">{candidates.data?.content.map((row) => <div key={row.participationId} className="rounded-2xl border border-line p-4"><p className="font-semibold">{row.name}</p><p className="mt-1 text-sm text-muted">예약 인원 {row.partySize}명</p><Button className="mt-3" variant="secondary" disabled={mutate.isPending} onClick={() => mutate.mutate({ participationId: row.participationId, marked: false })}>노쇼 처리</Button></div>)}</div>
        {!candidates.isLoading && candidates.data?.content.length === 0 && <p className="mt-3 text-sm text-muted">노쇼 처리 가능한 참여자가 없습니다.</p>}
        <div className="mt-7 border-t border-line pt-6"><h3 className="font-semibold">노쇼 처리된 참여자</h3>
          {histories.isLoading && <p className="mt-3 text-sm text-muted">노쇼 이력을 불러오는 중입니다.</p>}
          {histories.isError && <p className="mt-3 text-sm text-red-700">{requestErrorMessage(histories.error)}</p>}
          <div className="mt-4 space-y-3">{activeNoShows.map((history) => <div key={history.participationId} className="rounded-2xl border border-red-200 bg-red-50 p-4"><p className="font-semibold">{history.name}</p><p className="mt-1 text-sm text-muted">예약 인원 {history.partySize}명 · {new Date(history.processedAt).toLocaleString('ko-KR')} 처리</p><Button className="mt-3" variant="secondary" disabled={mutate.isPending} onClick={() => mutate.mutate({ participationId: history.participationId, marked: true })}>노쇼 해제</Button></div>)}</div>
          {!histories.isLoading && activeNoShows.length === 0 && <p className="mt-3 text-sm text-muted">현재 노쇼 처리된 참여자가 없습니다.</p>}
        </div>
        {mutate.isError && <p className="mt-4 text-sm text-red-700">{requestErrorMessage(mutate.error)}</p>}
      </div>}
    </section>
  </div>
}
