import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { MessageSquareWarning } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { adminApi, type AdminRow } from '@/features/admin/api/adminApi'
import { useAuthStore } from '@/stores/authStore'

const resources = {
  members: ['회원', adminApi.members], restaurants: ['식당', adminApi.restaurants], reservations: ['예약', adminApi.reservations],
  payments: ['결제', adminApi.payments], refunds: ['환불', adminApi.refunds], noShows: ['노쇼', adminApi.noShows],
  restaurantStats: ['식당별 성사율', adminApi.restaurantStats], memberNoShowRates: ['회원별 노쇼율', adminApi.memberNoShowRates],
} as const
type Resource = keyof typeof resources

function Row({ value }: { value: AdminRow }) {
  return <article className="rounded-2xl border border-line p-4"><dl className="grid gap-2 text-sm md:grid-cols-3">{Object.entries(value).map(([key, item]) => <div key={key}><dt className="text-xs text-muted">{key}</dt><dd className="mt-1 break-all font-medium">{item == null ? '-' : typeof item === 'object' ? JSON.stringify(item) : String(item)}</dd></div>)}</dl></article>
}

export function AdminDashboardPage() {
  const role = useAuthStore((state) => state.role)
  const [resource, setResource] = useState<Resource>('members')
  const overview = useQuery({ queryKey: ['admin', 'overview'], queryFn: adminApi.overview, enabled: role === 'admin' })
  const list = useQuery({ queryKey: ['admin', resource], queryFn: () => resources[resource][1]({ size: 100 }), enabled: role === 'admin' })
  if (role !== 'admin') return <Navigate to="/" replace />
  return <section className="page-container page-section"><PageHeader eyebrow="ADMIN" title="운영 관리" description="회원·식당·예약·결제·환불·노쇼와 운영 지표를 조회합니다." />
    <Link to="/admin/moderation" className="card mb-6 flex items-center gap-4 border-red-100 p-5 transition hover:-translate-y-0.5 hover:shadow-card"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600"><MessageSquareWarning /></span><div><h2 className="font-semibold">AI 채팅 검열</h2><p className="mt-1 text-sm text-muted">검토가 필요한 회원과 FLAGGED 메시지를 확인합니다.</p></div><span className="ml-auto text-sm font-semibold text-brand">조회하기 →</span></Link>
    <Link to="/admin/moderation/reports" className="card mb-6 flex items-center gap-4 border-orange-100 p-5 transition hover:-translate-y-0.5 hover:shadow-card"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-orange-50 text-orange-600"><MessageSquareWarning /></span><div><h2 className="font-semibold">사용자 신고 검토</h2><p className="mt-1 text-sm text-muted">신고 메시지와 주변 대화를 확인하고 위반 여부를 판단합니다.</p></div><span className="ml-auto text-sm font-semibold text-brand">검토하기 →</span></Link>
    {overview.data && <div className="card mb-6 p-6"><h2 className="font-semibold">운영 지표</h2><Row value={overview.data} /></div>}
    <div className="mb-5 flex flex-wrap gap-2">{Object.entries(resources).map(([key, value]) => <button key={key} onClick={() => setResource(key as Resource)} className={`rounded-full px-4 py-2 text-sm font-semibold ${resource === key ? 'bg-brand text-white' : 'bg-surface text-muted'}`}>{value[0]}</button>)}</div>
    <div className="card space-y-3 p-6">{list.isLoading && <p className="text-sm text-muted">불러오는 중입니다.</p>}{list.isError && <p className="text-sm text-red-700">데이터를 불러오지 못했습니다.</p>}{list.data?.content.map((row, index) => <Row key={String(row.id ?? row.memberId ?? row.restaurantId ?? index)} value={row} />)}</div>
  </section>
}
