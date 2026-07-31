import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { useRecruitingReservations } from '@/features/reservations/api/queries'
import { useRestaurants } from '@/features/restaurants/api/queries'
import type { Category } from '@/types/domain'

const categories: Array<'전체' | Category> = ['전체', '한식', '일식', '중식', '양식', '카페']

export function RecruitingReservationListPage() {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [category, setCategory] = useState<'전체' | Category>('전체')
  const [sort, setSort] = useState<'popular' | 'latest'>('popular')

  // 모집중 예약 검색(GET /reservations/search)은 category를 지원하지 않아, 목록은 실제 식당 검색과
  // 클라이언트에서 restaurantId 기준으로 합쳐 카테고리·지역·예약금을 함께 보여준다.
  const reservationsQuery = useRecruitingReservations({ date: date || undefined, time: time || undefined })
  const restaurantsQuery = useRestaurants()
  const isLoading = reservationsQuery.isLoading || restaurantsQuery.isLoading

  const items = useMemo(() => {
    const restaurants = restaurantsQuery.data ?? []
    return (reservationsQuery.data ?? [])
      .filter((item) => item.recruitmentStatus === 'OPEN' && item.availableCapacity > 0)
      .map((item) => ({ item, restaurant: restaurants.find((restaurant) => restaurant.id === item.restaurantId) }))
      .filter(({ restaurant }) => category === '전체' || restaurant?.category === category)
      .sort((a, b) => {
        if (sort === 'latest') return b.item.reservationId - a.item.reservationId
        return b.item.currentParticipantCount - a.item.currentParticipantCount
          || a.item.availableCapacity - b.item.availableCapacity
      })
  }, [category, reservationsQuery.data, restaurantsQuery.data, sort])

  return <section className="page-container page-section">
    <PageHeader eyebrow="RECRUITING" title="지금 참여 가능한 예약" description="식당별로 찾지 않아도 현재 예약 가능한 시간대를 한 번에 확인할 수 있어요." />

    <div className="card mb-8 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
      <label className="block"><span className="label">날짜</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="field h-12" /></label>
      <label className="block"><span className="label">시간</span><input type="time" value={time} onChange={(event) => setTime(event.target.value)} className="field h-12" /></label>
      <label className="block"><span className="label">음식 카테고리</span><select value={category} onChange={(event) => setCategory(event.target.value as '전체' | Category)} className="field h-12">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="block"><span className="label">정렬</span><select value={sort} onChange={(event) => setSort(event.target.value as 'popular' | 'latest')} className="field h-12"><option value="popular">인기순</option><option value="latest">최신순</option></select></label>
      <Button variant="ghost" className="h-12" onClick={() => { setDate(''); setTime(''); setCategory('전체'); setSort('popular') }}>초기화</Button>
    </div>

    <div className="mb-5 flex items-center justify-between"><p className="text-sm text-muted">예약 가능 시간 <strong className="text-ink">{items.length}</strong>개</p><p className="text-xs text-muted">인기순은 현재 예약 인원이 많은 순서입니다.</p></div>

    {isLoading
      ? <p className="py-20 text-center text-muted">불러오는 중입니다.</p>
      : items.length === 0
      ? <EmptyState title="조건에 맞는 예약이 없어요" description="날짜나 시간을 변경해 다른 예약을 찾아보세요." />
      : <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map(({ item, restaurant }) => restaurant && <article key={item.reservationId} className="card overflow-hidden">
          <div className="flex items-start justify-between bg-brand-soft p-5">
            <div><p className="text-xs font-semibold text-brand">{restaurant.category}</p><h2 className="mt-1 text-lg font-semibold">{item.restaurantName}</h2><p className="mt-2 flex items-center gap-1 text-xs text-muted"><MapPin size={13} />{restaurant.area}</p></div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand">모집중</span>
          </div>
          <div className="p-5">
            <div className="space-y-3 text-sm">
              <p className="flex items-center gap-2 font-semibold"><CalendarDays size={16} className="text-brand" />{new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(item.startAt))}</p>
              <p className="flex items-center gap-2 text-muted"><Clock3 size={16} />{item.startAt.slice(11, 16)}~{item.endAt.slice(11, 16)}</p>
              <p className="flex items-center gap-2 text-muted"><Users size={16} /><strong className="text-brand">잔여 좌석 {item.availableCapacity}석</strong> ({item.capacity}인 테이블)</p>
              <p className="text-xs text-muted">1인당 예약금 {restaurant.depositPerPerson.toLocaleString()}원</p>
            </div>
            <Link
              to={`/restaurants/${item.restaurantId}/reservations/new`}
              state={{
                type: 'JOIN',
                targetId: item.reservationId,
                session: { sessionId: item.sessionId, tableId: item.tableId, capacity: item.capacity, startAt: item.startAt, endAt: item.endAt, availableCapacity: item.availableCapacity },
                restaurantName: item.restaurantName,
                depositPerPerson: restaurant.depositPerPerson,
              }}
            >
              <Button fullWidth className="mt-5">참여하기</Button>
            </Link>
          </div>
        </article>)}
      </div>}
  </section>
}
