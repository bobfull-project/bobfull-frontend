import { CalendarDays, Clock3, MapPin, Star, Users } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useRestaurant } from '@/features/restaurants/api/queries'
import { reservationSlots } from '@/mocks/data'
import { formatDateTime } from '@/lib/utils'

export function RestaurantDetailPage() {
  const id = Number(useParams().restaurantId)
  const { data: restaurant, isLoading, error } = useRestaurant(id)
  if (isLoading) return <div className="page-container page-section text-muted">식당 정보를 불러오는 중입니다.</div>
  if (error || !restaurant) return <div className="page-container page-section">식당을 찾을 수 없습니다.</div>
  const availableSlots = reservationSlots.filter((item) => item.restaurantId === id)
  return <section className="page-container page-section"><div className="grid gap-8 lg:grid-cols-[1.45fr_.75fr]">
    <div><div className="grid min-h-80 place-items-center rounded-[28px] bg-gradient-to-br from-brand-soft to-accent-soft text-9xl md:min-h-[460px]">{restaurant.image}</div><div className="py-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold text-brand">{restaurant.category}</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">{restaurant.name}</h1></div><span className="flex items-center gap-1 text-sm font-semibold"><Star size={16} fill="currentColor" /> {restaurant.rating}</span></div><p className="mt-4 flex items-center gap-2 text-sm text-muted"><MapPin size={16} />{restaurant.area} · {restaurant.priceRange}</p><p className="mt-7 max-w-2xl leading-7 text-muted">{restaurant.description}</p><div className="mt-6 flex gap-2">{restaurant.tags.map((tag) => <span key={tag} className="rounded-full bg-sub-soft px-3 py-2 text-xs text-brand">{tag}</span>)}</div></div></div>
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="card p-6 shadow-card">
        <p className="text-sm font-semibold text-brand">예약 가능 시간</p>
        <h2 className="mt-2 text-xl font-semibold">원하는 시간를 선택하세요</h2>
        <p className="mt-3 text-sm leading-6 text-muted">예약 시간과 테이블 정원은 사장님이 미리 설정합니다.</p>
      </div>
      <div className="mt-4 space-y-3">
        {availableSlots.map((slot) => {
          const soldOut = slot.status === 'SOLD_OUT' || slot.remainingSeats === 0
          return <div key={slot.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold"><CalendarDays size={16} className="text-brand" />{formatDateTime(slot.dateTime)}</p>
                <p className="mt-3 flex items-center gap-2 text-sm text-muted"><Clock3 size={15} />시간 예약</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-muted"><Users size={15} /><strong className={soldOut ? 'text-muted' : 'text-brand'}>{soldOut ? '잔여 좌석 없음' : `잔여 좌석 ${slot.remainingSeats}석`}</strong><span>({slot.tableCapacity}인 테이블)</span></p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${soldOut ? 'bg-surface text-muted' : 'bg-accent-soft text-accent-active'}`}>{soldOut ? '마감' : '예약 가능'}</span>
            </div>
            {soldOut
              ? <Button fullWidth variant="secondary" className="mt-5" disabled>예약 마감</Button>
              : <Link to={`/restaurants/${id}/reservations/new?slotId=${slot.id}`}><Button fullWidth className="mt-5">이 시간대 예약하기</Button></Link>}
          </div>
        })}
      </div>
    </aside>
  </div></section>
}
