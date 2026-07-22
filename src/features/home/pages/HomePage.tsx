import { ArrowRight, CalendarPlus, MapPin, Search, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { useRestaurants } from '@/features/restaurants/api/queries'
import { RestaurantCard } from '@/features/restaurants/components/RestaurantCard'

export function HomePage() {
  const { data = [] } = useRestaurants()
  return <>
    <section className="page-container page-section">
      <div className="relative min-h-[570px] overflow-hidden rounded-[28px] border border-line bg-canvas px-6 py-12 shadow-card md:px-14 md:py-16">
        <img src="/images/bobfull-hero-banner.png" alt="함께 밥을 나누는 여행자들과 따뜻한 식탁 일러스트" className="absolute inset-0 h-full w-full object-cover object-center opacity-25 md:opacity-100" />
        <div className="relative z-10 max-w-md">
          <p className="mb-4 text-sm font-semibold text-brand">혼밥이 모여, 한 테이블이 되는 곳</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">혼자 먹던 한 끼가,<br />함께하는 한 끼가 됩니다.</h1>
          <p className="mt-5 max-w-sm text-base leading-7 text-muted">오늘, 여기서 우리의 밥풀이 이어져요. 제주에서 만나는 따뜻한 식사와 새로운 인연을 시작해 보세요.</p>
          <div className="mt-7 space-y-3 text-sm font-medium text-ink">
            <p className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-accent-soft text-accent"><Users size={16} /></span>혼자도 편안하게</p>
            <p className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-sub-soft text-sub-active"><CalendarPlus size={16} /></span>함께라서 더 따뜻하게</p>
            <p className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-brand-soft text-brand"><MapPin size={16} /></span>맛있는 인연이 시작되는 곳</p>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to="/restaurants"><Button className="gap-2"><Search size={18} />모임 둘러보기</Button></Link><Link to="/restaurants/1/reservations/new"><Button variant="secondary" className="gap-2"><CalendarPlus size={18} />모임 만들기</Button></Link></div>
        </div>
      </div>
    </section>
    <section className="page-container pb-14"><div className="grid gap-4 md:grid-cols-3">{[{ icon: MapPin, title: '내 주변 식당', text: '지역과 음식 취향으로 빠르게 찾아요.' }, { icon: Users, title: '부담 없는 참여', text: '시간과 인원을 확인하고 바로 참여해요.' }, { icon: CalendarPlus, title: '간단한 모집', text: '식당과 시간만 정하면 모임이 열려요.' }].map((item) => <div key={item.title} className="card p-6"><item.icon className="mb-5 text-brand" /><h2 className="font-semibold">{item.title}</h2><p className="mt-2 text-sm text-muted">{item.text}</p></div>)}</div></section>
    <section className="bg-surface py-14 md:py-18"><div className="page-container"><div className="mb-7 flex items-end justify-between"><div><p className="mb-2 text-sm font-semibold text-brand">지금 인기 있어요</p><h2 className="text-2xl font-semibold tracking-tight md:text-3xl">함께하기 좋은 식당</h2></div><Link to="/restaurants" className="hidden items-center gap-1 text-sm font-semibold sm:flex">전체 보기 <ArrowRight size={16} /></Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{data.slice(0, 3).map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div></div></section>
  </>
}
