import { CalendarDays, ChevronRight, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { Link, Navigate } from 'react-router-dom'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { reservationRepository } from '@/features/reservations/api/reservationRepository'
import { reservationStatusClass, reservationStatusLabel } from '@/features/reservations/labels'
import { formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

export function MyReservationsPage() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const reservationsQuery = useQuery({
    queryKey: ['reservations', 'me'],
    queryFn: () => reservationRepository.getMine(),
    enabled: Boolean(accessToken),
  })

  if (!accessToken) return <Navigate to="/login" replace />

  const data = reservationsQuery.data ?? []
  return <section className="page-container page-section">
    <PageHeader eyebrow="MY RESERVATIONS" title="내 예약" description="내가 만들거나 참여한 식사 예약을 확인할 수 있습니다." />
    {reservationsQuery.isLoading && <div className="card grid min-h-64 place-items-center p-8 text-sm text-muted">예약을 불러오는 중입니다.</div>}
    {reservationsQuery.isError && <div className="card p-8 text-center">
      <p className="font-semibold">예약을 불러오지 못했습니다.</p>
      <p className="mt-2 text-sm text-muted">잠시 후 다시 시도해주세요.</p>
      <Button variant="secondary" className="mt-5" onClick={() => reservationsQuery.refetch()}>다시 시도</Button>
    </div>}
    {reservationsQuery.isSuccess && (data.length === 0
      ? <EmptyState title="아직 예약이 없어요" description="마음에 드는 식당의 예약에 참여해 보세요." />
      : <div className="grid gap-4">{data.map((item) => <Link key={item.reservationId} to={`/reservations/${item.reservationId}`} className="card flex flex-col gap-5 p-6 transition hover:-translate-y-0.5 hover:shadow-card md:flex-row md:items-center md:justify-between"><div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${reservationStatusClass[item.reservationStatus]}`}>{reservationStatusLabel[item.reservationStatus]}</span><h2 className="mt-3 text-lg font-semibold">{item.restaurantName}</h2><p className="mt-2 text-sm text-muted">모집 상태 {item.recruitmentStatus === 'OPEN' ? '모집 중' : '마감'}</p></div><div className="flex items-center gap-6"><div className="min-w-48 space-y-2 text-sm text-muted"><p className="flex items-center gap-2"><CalendarDays size={16} />{formatDateTime(item.startAt)}</p><p className="flex items-center gap-2"><Users size={16} />내 인원 {item.partySize}명</p></div><ChevronRight className="shrink-0 text-muted" size={20} /></div></Link>)}</div>)}
  </section>
}
