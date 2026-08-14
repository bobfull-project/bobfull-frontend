import { ArrowRight, CalendarPlus, MapPin, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { HeroOrganicButtons } from '@/features/home/components/HeroOrganicButtons'
import { useRestaurants } from '@/features/restaurants/api/queries'
import { RestaurantCard } from '@/features/restaurants/components/RestaurantCard'

export function HomePage() {
  const navigate = useNavigate()
  const { data = [] } = useRestaurants()
  return <>
    <section className="page-container py-3 md:py-4">
      <div className="relative min-h-[620px] overflow-hidden rounded-[24px] border border-line bg-canvas px-6 py-10 md:aspect-[8/5] md:min-h-0 md:px-14 md:py-10">
        <img src="/bobfull-hero-field.png" alt="제주 들판과 벼가 그려진 따뜻한 배경" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center md:pt-1">
          <p className="mb-5 text-xs font-semibold tracking-[.2em] text-brand md:text-sm"><span aria-hidden="true">◆ </span>혼밥이 모여, 한 테이블이 되는 곳<span aria-hidden="true"> ◆</span></p>
          <h1 className="font-hero text-[2rem] font-normal leading-[1.42] tracking-[-.025em] text-ink sm:text-[2.35rem] md:text-[3.35rem]"><span className="block whitespace-nowrap">혼자 먹던 한 끼가,</span><span className="block whitespace-nowrap"><span className="text-[#58734f]">함께하는 한 끼</span>가 됩니다.</span></h1>
          <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted md:mt-5 md:text-base">오늘, 여기서 우리의 밥풀이 이어져요.<br />제주에서 만나는 따뜻한 식사와 새로운 인연을 시작해 보세요.</p>
          <div className="mt-6 flex flex-col items-center gap-3 text-sm font-medium text-ink sm:flex-row sm:gap-0 md:mt-5">
            <p className="flex items-center gap-3 px-5"><span className="grid size-10 place-items-center rounded-full bg-accent-soft text-accent"><Users size={19} /></span>혼자도 편안하게</p>
            <span className="hidden h-7 w-px bg-line sm:block" aria-hidden="true" />
            <p className="flex items-center gap-3 px-5"><span className="grid size-10 place-items-center rounded-full bg-sub-soft text-sub-active"><CalendarPlus size={19} /></span>함께라서 더 따뜻하게</p>
            <span className="hidden h-7 w-px bg-line sm:block" aria-hidden="true" />
            <p className="flex items-center gap-3 px-5"><span className="grid size-10 place-items-center rounded-full bg-brand-soft text-brand"><MapPin size={19} /></span>맛있는 인연이 시작되는 곳</p>
          </div>
          <HeroOrganicButtons
            onBrowseGatherings={() => navigate('/recruiting')}
            onFindRestaurant={() => navigate('/restaurants')}
          />
        </div>
      </div>
    </section>
    <section className="border-y border-line bg-[#fdfaf4] py-14 md:py-18"><div className="page-container"><div className="mb-8 flex items-end justify-between"><div><p className="mb-3 text-xs font-semibold tracking-[.18em] text-brand">식당에서 시작되는 만남</p><h2 className="font-display text-3xl font-semibold tracking-[-.04em] md:text-4xl">함께하기 좋은 식당</h2></div><Link to="/restaurants" className="hidden items-center gap-1 text-sm font-semibold sm:flex">전체 보기 <ArrowRight size={16} /></Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.slice(0, 3).map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div></div></section>
  </>
}
