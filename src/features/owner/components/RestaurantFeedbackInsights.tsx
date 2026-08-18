import { useQuery } from '@tanstack/react-query'
import { MessageSquareText, ShieldCheck, UsersRound } from 'lucide-react'
import { getRestaurantFeedbackInsights, type FeedbackCategory, type FeedbackSentiment } from '@/features/owner/api/restaurantApi'

const categoryLabel: Record<FeedbackCategory, string> = {
  FOOD: '음식', SERVICE: '서비스', PRICE: '가격', CLEANLINESS: '청결', ETC: '기타',
}

const sentimentStyle: Record<FeedbackSentiment, { label: string; className: string; dotClassName: string }> = {
  POSITIVE: { label: '긍정', className: 'bg-[#eef5ea] text-[#4f6945]', dotClassName: 'bg-[#69865d]' },
  NEGATIVE: { label: '부정', className: 'bg-red-50 text-red-700', dotClassName: 'bg-red-500' },
  NEUTRAL: { label: '중립', className: 'bg-gray-100 text-gray-600', dotClassName: 'bg-gray-400' },
}

const formatPeriod = (from: string, to: string) => {
  const formatter = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' })
  return `${formatter.format(new Date(from))} ~ ${formatter.format(new Date(to))}`
}

export function RestaurantFeedbackInsights({ restaurantId }: { restaurantId: number }) {
  const query = useQuery({
    queryKey: ['owner', 'restaurant', restaurantId, 'feedback-insights'],
    queryFn: () => getRestaurantFeedbackInsights(restaurantId),
    enabled: Number.isFinite(restaurantId),
  })

  return <section className="card mt-6 overflow-hidden">
    <div className="flex flex-col gap-4 border-b border-line px-6 py-5 sm:flex-row sm:items-end sm:justify-between md:px-8">
      <div>
        <p className="text-xs font-semibold tracking-[.14em] text-brand">CUSTOMER INSIGHT</p>
        <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold"><MessageSquareText size={20} className="text-brand" />최근 7일 고객 반응</h2>
        <p className="mt-2 text-sm text-muted">식사 후 채팅에서 반복된 의견을 익명으로 모아 보여드려요.</p>
      </div>
      {query.data && <p className="shrink-0 text-xs font-medium text-muted">{formatPeriod(query.data.from, query.data.to)} 기준</p>}
    </div>

    {query.isLoading && <div className="grid min-h-44 place-items-center p-8 text-sm text-muted">고객 반응을 불러오는 중입니다.</div>}
    {query.isError && <div className="grid min-h-44 place-items-center p-8 text-center"><div><p className="font-semibold">고객 반응을 불러오지 못했습니다.</p><button type="button" className="mt-3 text-sm font-semibold text-brand underline underline-offset-4" onClick={() => query.refetch()}>다시 불러오기</button></div></div>}
    {query.data && query.data.insights.length === 0 && <div className="grid min-h-48 place-items-center px-6 py-10 text-center"><div className="max-w-md"><span className="mx-auto grid size-12 place-items-center rounded-full bg-brand-soft text-brand"><MessageSquareText size={21} /></span><h3 className="mt-4 font-semibold">아직 모인 고객 반응이 없습니다</h3><p className="mt-2 text-sm leading-6 text-muted">최근 7일 동안 같은 주제에 의견을 남긴 고객이 3명 이상일 때 인사이트가 표시됩니다.</p></div></div>}
    {query.data && query.data.insights.length > 0 && <div className="grid gap-3 p-6 md:grid-cols-2 md:p-8">
      {query.data.insights.map((insight) => {
        const sentiment = sentimentStyle[insight.sentiment]
        return <article key={`${insight.category}-${insight.aspectType}-${insight.normalizedAspect}-${insight.opinionType}-${insight.sentiment}`} className="rounded-2xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand">{categoryLabel[insight.category]}</span><span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${sentiment.className}`}><span className={`size-1.5 rounded-full ${sentiment.dotClassName}`} />{sentiment.label}</span></div>
          <h3 className="mt-4 text-lg font-semibold">{insight.normalizedAspect}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{insight.summary}</p>
          <p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-muted"><UsersRound size={14} />고객 {insight.count}명의 공통 의견</p>
        </article>
      })}
    </div>}
    <div className="flex items-start gap-2 border-t border-line bg-[#faf8f3] px-6 py-4 text-xs leading-5 text-muted md:px-8"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand" /><p>개인정보 보호를 위해 채팅 원문과 회원 정보는 제공하지 않으며, 3명 이상의 익명 의견만 집계합니다.</p></div>
  </section>
}
