import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clock3, MapPin, Star, Users } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { SeatIndicator } from '@/components/ui/SeatIndicator'
import { useRestaurant } from '@/features/restaurants/api/queries'
import { getAvailableSessions } from '@/features/restaurants/api/sessionApi'
import { formatDateTime } from '@/lib/utils'

const today = new Date().toLocaleDateString('sv-SE')

export function RestaurantDetailPage() {
  const id = Number(useParams().restaurantId)
  const { data: restaurant, isLoading, error } = useRestaurant(id)
  const [date, setDate] = useState(today)
  const sessionsQuery = useQuery({
    queryKey: ['restaurants', id, 'dining-sessions', date],
    queryFn: () => getAvailableSessions(id, date),
    enabled: Number.isFinite(id),
  })
  const availableSlots = sessionsQuery.data ?? []

  if (isLoading) return <div className="page-container page-section text-muted">식당 정보를 불러오는 중입니다.</div>
  if (error || !restaurant) return <div className="page-container page-section">식당을 찾을 수 없습니다.</div>

  return <section className="page-container page-section"><div className="grid gap-8 lg:grid-cols-[1.45fr_.75fr]">
    <div><div className="grid min-h-80 overflow-hidden rounded-[28px] bg-gradient-to-br from-brand-soft to-accent-soft text-9xl md:min-h-[460px]">{restaurant.imageUrl ? <img src={restaurant.imageUrl} alt={`${restaurant.name} 이미지`} className="h-full min-h-80 w-full object-cover md:min-h-[460px]" /> : <span className="m-auto">{restaurant.image}</span>}</div><div className="py-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-brand">{restaurant.category}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{restaurant.name}</h1></div><span className="flex items-center gap-1 text-sm font-semibold"><Star size={16} fill="currentColor" /> {restaurant.rating}</span></div><p className="mt-4 flex items-center gap-2 text-sm text-muted"><MapPin size={16} />{restaurant.area} · {restaurant.priceRange}</p><p className="mt-3 text-sm font-semibold">1인당 예약금 {restaurant.depositPerPerson.toLocaleString()}원</p><p className="mt-7 max-w-2xl leading-7 text-muted">{restaurant.description}</p><div className="mt-6 flex gap-2">{restaurant.tags.map((tag) => <span key={tag} className="rounded-full bg-sub-soft px-3 py-2 text-xs text-brand">{tag}</span>)}</div></div></div>
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="card p-6 shadow-card">
        <p className="text-sm font-semibold text-brand">예약 가능 시간</p>
        <h2 className="font-display mt-2 text-2xl font-semibold">원하는 시간대를 선택하세요</h2>
        <p className="mt-3 text-sm leading-6 text-muted">합석 테이블과 시작·종료 시간은 사장님이 미리 설정합니다.</p>
        <label className="mt-4 block"><span className="label">날짜</span><input type="date" min={today} className="field h-11" value={date} onChange={(event) => setDate(event.target.value)} /></label>
      </div>
      <div className="mt-4 space-y-3">
        {sessionsQuery.isLoading && <p className="card p-5 text-sm text-muted">불러오는 중입니다.</p>}
        {!sessionsQuery.isLoading && availableSlots.length === 0 && <p className="card p-5 text-sm text-muted">선택한 날짜에 예약 가능한 시간이 없습니다.</p>}
        {availableSlots.map((slot) => {
          const soldOut = slot.availableCapacity <= 0
          return <div key={slot.sessionId} className="border-b border-line bg-white/45 p-5 first:border-t">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-xs font-semibold text-muted"><CalendarDays size={14} className="text-brand" />{formatDateTime(slot.startAt)}</p>
                <p className="font-display mt-2 flex items-center gap-2 text-3xl font-semibold"><Clock3 size={16} className="text-muted" />{slot.startAt.slice(11, 16)}<span className="font-sans text-xs font-normal text-muted">~ {slot.endAt.slice(11, 16)}</span></p>
                <SeatIndicator className="mt-4" capacity={slot.capacity} occupied={slot.currentParticipantCount} />
                <p className={`mt-2 flex items-center gap-2 text-sm font-semibold ${soldOut ? 'text-muted' : 'text-brand'}`}><Users size={15} />{soldOut ? '잔여 좌석 없음' : `남은 자리 ${slot.availableCapacity}석`}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${soldOut ? 'bg-surface text-muted' : 'bg-accent-soft text-accent-active'}`}>{soldOut ? '마감' : '예약 가능'}</span>
            </div>
            {soldOut
              ? <Button fullWidth variant="secondary" className="mt-5" disabled>예약 마감</Button>
              : <Link
                  to={`/restaurants/${id}/reservations/new`}
                  state={{
                    type: slot.reservationId === null ? 'CREATE' : 'JOIN',
                    targetId: slot.reservationId ?? slot.sessionId,
                    session: slot,
                    restaurantName: restaurant.name,
                    depositPerPerson: restaurant.depositPerPerson,
                  }}
                >
                  <Button fullWidth className="mt-5">{slot.reservationId === null ? '이 시간대 예약하기' : '참여하기'}</Button>
                </Link>}
          </div>
        })}
      </div>
    </aside>
  </div></section>
}
