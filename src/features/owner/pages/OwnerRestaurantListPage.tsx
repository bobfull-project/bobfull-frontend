import { useQuery } from '@tanstack/react-query'
import { ChevronRight, MapPin, Plus, Store } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { getMyRestaurants } from '@/features/owner/api/restaurantApi'

export function OwnerRestaurantListPage() {
  const { data: restaurants = [], isLoading, isError } = useQuery({
    queryKey: ['owner', 'restaurants'],
    queryFn: getMyRestaurants,
  })

  return <div className="mx-auto max-w-6xl">
    <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold tracking-[.16em] text-brand">MY RESTAURANTS</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">내 식당</h1>
        <p className="mt-3 text-sm leading-6 text-muted">여러 식당을 등록하고 식당별 예약 가능 시간을 관리할 수 있습니다.</p>
      </div>
      <Link to="/owner/restaurants/new"><Button className="gap-2"><Plus size={17} />식당 등록</Button></Link>
    </header>

    {isLoading && <p className="py-20 text-center text-sm text-muted">불러오는 중입니다.</p>}
    {isError && <p className="py-20 text-center text-sm text-red-700">식당 목록을 불러오지 못했습니다.</p>}
    {!isLoading && !isError && (restaurants.length === 0
      ? <EmptyState title="등록한 식당이 없습니다" description="먼저 식당을 등록한 후 예약 가능 시간을 설정해주세요." />
      : <div className="grid gap-4">
        {restaurants.map((restaurant) => <Link key={restaurant.restaurantId} to={`/owner/restaurants/${restaurant.restaurantId}`} className="card grid gap-5 p-5 transition-colors hover:border-[#cfc2b0] sm:grid-cols-[112px_1fr_auto] sm:items-center">
          {restaurant.imageUrl
            ? <img src={restaurant.imageUrl} alt={`${restaurant.name} 이미지`} className="h-24 w-28 shrink-0 rounded-xl object-cover" />
            : <span className="grid h-24 w-28 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand"><Store size={28} /></span>}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-[-.02em]">{restaurant.name}</h2>
              <span className="rounded-md bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">{restaurant.category}</span>
            </div>
            <p className="mt-2 flex items-center gap-1 truncate text-sm text-muted"><MapPin size={14} />{restaurant.address}</p>
            <p className="mt-2 text-xs text-muted">1인당 예약금 {restaurant.depositPerPerson.toLocaleString()}원</p>
          </div>
          <span className="flex items-center gap-2 text-sm font-semibold text-[#627d55]">관리하기<ChevronRight size={17} /></span>
        </Link>)}
      </div>)}
  </div>
}
