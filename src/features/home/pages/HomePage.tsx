import { ArrowRight } from 'lucide-react'
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
        <img src="/bobfull-hero-jeju-table-v2.png" alt="제주 바다와 한라산을 배경으로 세 사람이 함께 식사하는 일러스트" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center md:pt-1">
          <h1 className="font-hero text-[2rem] font-normal leading-[1.42] tracking-[-.025em] text-ink sm:text-[2.35rem] md:text-[3.35rem]"><span className="block whitespace-nowrap">혼자 먹던 한 끼가,</span><span className="block whitespace-nowrap"><span className="text-[#58734f]">함께하는 한 끼</span>가 됩니다.</span></h1>
          <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted md:mt-5 md:text-base">오늘, 여기서 우리의 밥풀이 이어져요.<br />제주에서 만나는 따뜻한 식사와 새로운 인연을 시작해 보세요.</p>
          <HeroOrganicButtons
            onBrowseGatherings={() => navigate('/recruiting')}
            onFindRestaurant={() => navigate('/restaurants')}
          />
        </div>
      </div>
    </section>
    <section className="border-y border-line bg-[#fdfaf4] py-12 md:py-16">
      <div className="page-container">
        <h2 className="font-hero text-3xl font-normal tracking-[-.035em] text-ink md:text-4xl">함께하는 한 끼, 이렇게 시작해요</h2>
        <div className="mt-9 grid gap-8 md:grid-cols-3 md:gap-10">
          <article className="border-t border-[#ddd3c6] pt-5"><p className="font-hero text-2xl text-[#e86425]">01</p><h3 className="mt-3 text-lg font-semibold">마음에 드는 식당을 찾아보세요</h3><p className="mt-3 text-sm leading-6 text-muted">제주의 다양한 식당을 둘러보고, 함께 먹고 싶은 한 끼를 찾아보세요.</p></article>
          <article className="border-t border-[#ddd3c6] pt-5"><p className="font-hero text-2xl text-[#e86425]">02</p><h3 className="mt-3 text-lg font-semibold">참여할 모임을 확인하세요</h3><p className="mt-3 text-sm leading-6 text-muted">원하는 날짜와 시간에 열려있는 모임과 현재 참여 인원을 확인해 보세요.</p></article>
          <article className="border-t border-[#ddd3c6] pt-5"><p className="font-hero text-2xl text-[#e86425]">03</p><h3 className="mt-3 text-lg font-semibold">모임에 참여하고 함께 식사하세요</h3><p className="mt-3 text-sm leading-6 text-muted">원하는 모임에 참여한 뒤, 약속한 시간에 새로운 사람들과 한 테이블에서 만나요.</p></article>
        </div>
      </div>
    </section>
    <section className="py-14 md:py-18"><div className="page-container"><div className="mb-8 flex items-end justify-between"><div><p className="mb-3 text-xs font-semibold tracking-[.18em] text-brand">식당에서 시작되는 만남</p><h2 className="font-display text-3xl font-semibold tracking-[-.04em] md:text-4xl">함께하기 좋은 식당</h2></div><Link to="/restaurants" className="hidden items-center gap-1 text-sm font-semibold sm:flex">전체 보기 <ArrowRight size={16} /></Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.slice(0, 3).map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div></div></section>
  </>
}
