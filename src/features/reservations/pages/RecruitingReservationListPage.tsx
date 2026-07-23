import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { reservationSlots, restaurants } from '@/mocks/data'
import type { Category } from '@/types/domain'

const categories: Array<'전체' | Category> = ['전체', '한식', '일식', '중식', '양식', '카페']
const timeOptions = ['전체', ...Array.from(new Set(reservationSlots.map((slot) => slot.dateTime.slice(11, 16)))).sort()]

export function RecruitingReservationListPage() {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('전체')
  const [category, setCategory] = useState<'전체' | Category>('전체')
  const [sort, setSort] = useState<'popular' | 'latest'>('popular')

  const items = useMemo(() => reservationSlots
    .filter((slot) => slot.status === 'AVAILABLE' && slot.remainingSeats > 0)
    .map((slot) => ({ slot, restaurant: restaurants.find((restaurant) => restaurant.id === slot.restaurantId) }))
    .filter((item) => item.restaurant)
    .filter(({ slot, restaurant }) =>
      (!date || slot.dateTime.slice(0, 10) === date)
      && (time === '전체' || slot.dateTime.slice(11, 16) === time)
      && (category === '전체' || restaurant?.category === category))
    .sort((a, b) => {
      if (sort === 'latest') return b.slot.id - a.slot.id
      const aReserved = a.slot.tableCapacity - a.slot.remainingSeats
      const bReserved = b.slot.tableCapacity - b.slot.remainingSeats
      return bReserved - aReserved || a.slot.remainingSeats - b.slot.remainingSeats
    }), [category, date, sort, time])

  return <section className="page-container page-section">
    <PageHeader eyebrow="RECRUITING" title="지금 참여 가능한 예약" description="식당별로 찾지 않아도 현재 예약 가능한 시간대를 한 번에 확인할 수 있어요." />

    <div className="card mb-8 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
      <label className="block"><span className="label">날짜</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="field h-12" /></label>
      <label className="block"><span className="label">시간</span><select value={time} onChange={(event) => setTime(event.target.value)} className="field h-12">{timeOptions.map((item) => <option key={item} value={item}>{item === '전체' ? '전체 시간' : item}</option>)}</select></label>
      <label className="block"><span className="label">음식 카테고리</span><select value={category} onChange={(event) => setCategory(event.target.value as '전체' | Category)} className="field h-12">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="block"><span className="label">정렬</span><select value={sort} onChange={(event) => setSort(event.target.value as 'popular' | 'latest')} className="field h-12"><option value="popular">인기순</option><option value="latest">최신순</option></select></label>
      <Button variant="ghost" className="h-12" onClick={() => { setDate(''); setTime('전체'); setCategory('전체'); setSort('popular') }}>초기화</Button>
    </div>

    <div className="mb-5 flex items-center justify-between"><p className="text-sm text-muted">예약 가능 시간 <strong className="text-ink">{items.length}</strong>개</p><p className="text-xs text-muted">인기순은 현재 예약 인원이 많은 순서입니다.</p></div>

    {items.length === 0
      ? <EmptyState title="조건에 맞는 예약이 없어요" description="날짜나 시간을 변경해 다른 예약을 찾아보세요." />
      : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map(({ slot, restaurant }) => restaurant && <article key={slot.id} className="card overflow-hidden">
          <div className="flex items-start justify-between bg-brand-soft p-5">
            <div><p className="text-xs font-semibold text-brand">{restaurant.category}</p><h2 className="mt-1 text-lg font-semibold">{restaurant.name}</h2><p className="mt-2 flex items-center gap-1 text-xs text-muted"><MapPin size={13} />{restaurant.area}</p></div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand">모집중</span>
          </div>
          <div className="p-5">
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2 font-semibold"><CalendarDays size={16} className="text-brand" />{new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(slot.dateTime))}</p>
              <p className="flex items-center gap-2 text-muted"><Clock3 size={16} />{slot.dateTime.slice(11, 16)} 시간대</p>
              <p className="flex items-center gap-2 text-muted"><Users size={16} /><strong className="text-brand">잔여 좌석 {slot.remainingSeats}석</strong> ({slot.tableCapacity}인 테이블)</p>
            </div>
            <Link to={`/restaurants/${restaurant.id}/reservations/new?slotId=${slot.id}`}><Button fullWidth className="mt-5">이 시간 예약하기</Button></Link>
          </div>
        </article>)}
      </div>}
  </section>
}
