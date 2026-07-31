import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { useRestaurants } from '@/features/restaurants/api/queries'
import { RestaurantCard } from '@/features/restaurants/components/RestaurantCard'
import type { Category } from '@/types/domain'

const categories: Array<'전체' | Category> = ['전체', '한식', '일식', '중식', '양식', '카페']

// 입력할 때마다 검색 API를 호출하지 않도록 300ms 뒤 최종 값만 반영한다.
function useDebouncedValue<T>(value: T, delayMs = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs)
    return () => window.clearTimeout(timer)
  }, [value, delayMs])
  return debounced
}

export function RestaurantListPage() {
  const [category, setCategory] = useState<'전체' | Category>('전체')
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebouncedValue(keyword)
  const { data = [], isLoading } = useRestaurants({
    keyword: debouncedKeyword || undefined,
    category: category === '전체' ? undefined : category,
  })
  return <section className="page-container page-section"><PageHeader eyebrow="RESTAURANTS" title="어디서 함께 먹을까요?" description="원하는 지역과 메뉴를 찾아보고, 열려 있는 식사 모임에 참여해 보세요." />
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`h-10 shrink-0 rounded-full px-4 text-sm font-medium ${category === item ? 'bg-brand text-white' : 'border border-line bg-white text-muted hover:bg-sub-soft hover:text-brand'}`}>{item}</button>)}</div><label className="relative block md:w-72"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={17} /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} className="field h-11 pl-11" placeholder="식당, 지역 검색" /></label></div>
    {isLoading ? <p className="py-20 text-center text-muted">식당을 불러오는 중입니다.</p> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div>}
  </section>
}
