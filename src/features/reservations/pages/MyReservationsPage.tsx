import { CalendarDays, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { reservationRepository } from '@/features/reservations/api/reservationRepository'
import { formatDateTime } from '@/lib/utils'

export function MyReservationsPage() {
  const { data = [] } = useQuery({ queryKey: ['reservations', 'me'], queryFn: reservationRepository.getMine })
  return <section className="page-container page-section"><PageHeader eyebrow="MY RESERVATIONS" title="내 예약" description="내가 만들거나 참여한 식사 모임을 확인할 수 있습니다." />{data.length === 0 ? <EmptyState title="아직 예약이 없어요" description="마음에 드는 식당의 밥 모임에 참여해 보세요." /> : <div className="grid gap-4">{data.map((item) => <article key={item.id} className="card flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between"><div><span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-active">{item.status}</span><h2 className="mt-3 text-lg font-semibold">{item.restaurantName}</h2><p className="mt-2 text-sm text-muted">{item.note}</p></div><div className="min-w-56 space-y-2 text-sm text-muted"><p className="flex items-center gap-2"><CalendarDays size={16} />{formatDateTime(item.dateTime)}</p><p className="flex items-center gap-2"><Users size={16} />{item.joined}/{item.capacity}명 · 호스트 {item.hostName}</p></div></article>)}</div>}</section>
}
