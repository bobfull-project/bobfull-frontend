import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ShieldAlert } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { moderationApi, type ModerationCategory, type ModerationRiskLevel } from '@/features/admin/api/moderationApi'
import { formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const categoryLabel: Record<ModerationCategory, string> = {
  PROFANITY: '욕설',
  PERSONAL_INFORMATION: '개인정보',
  SPAM: '스팸',
}

const riskLabel: Record<ModerationRiskLevel, string> = { LOW: '낮음', MEDIUM: '중간', HIGH: '높음' }
const riskClass: Record<ModerationRiskLevel, string> = {
  LOW: 'bg-amber-50 text-amber-700',
  MEDIUM: 'bg-orange-50 text-orange-700',
  HIGH: 'bg-red-50 text-red-700',
}

export function AdminModerationDetailPage() {
  const role = useAuthStore((state) => state.role)
  const memberId = Number(useParams().memberId)
  const detailQuery = useQuery({
    queryKey: ['admin', 'moderation', 'members', memberId],
    queryFn: () => moderationApi.getMember(memberId),
    enabled: role === 'admin' && Number.isFinite(memberId),
  })

  if (role !== 'admin') return <Navigate to="/" replace />
  if (!Number.isFinite(memberId)) return <Navigate to="/admin/moderation" replace />

  return <section className="page-container page-section">
    <div className="mb-4"><Link to="/admin/moderation" className="text-sm font-semibold text-brand">← 검열 목록으로</Link></div>
    <PageHeader eyebrow="MODERATION DETAIL" title={`회원 #${memberId} 검열 상세`} description="FLAGGED로 분류된 실제 메시지와 위험도를 확인합니다. 문맥을 검토한 뒤 사람이 최종 판단해야 합니다." />

    {detailQuery.isLoading && <div className="card grid min-h-64 place-items-center p-8 text-sm text-muted">회원 검열 상세를 불러오는 중입니다.</div>}
    {detailQuery.isError && <div className="card p-8 text-center"><AlertTriangle className="mx-auto text-red-600" /><p className="mt-4 font-semibold">검열 상세를 불러오지 못했습니다.</p><Button variant="secondary" className="mt-5" onClick={() => detailQuery.refetch()}>다시 시도</Button></div>}

    {detailQuery.data && <div className="space-y-6">
      <div className="card grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-6"><div><span className="text-xs text-muted">검토 상태</span><p className={`mt-2 font-semibold ${detailQuery.data.reviewStatus === 'REVIEW_REQUIRED' ? 'text-red-700' : 'text-green-700'}`}>{detailQuery.data.reviewStatus === 'REVIEW_REQUIRED' ? '검토 필요' : '정상'}</p></div><div><span className="text-xs text-muted">전체 검출</span><p className="mt-2 text-xl font-semibold">{detailQuery.data.totalFlaggedCount}건</p></div><div><span className="text-xs text-muted">검토 대상</span><p className="mt-2 text-xl font-semibold">{detailQuery.data.reviewTargetCount}건</p></div>{(['LOW', 'MEDIUM', 'HIGH'] as const).map((risk) => <div key={risk}><span className="text-xs text-muted">위험도 {riskLabel[risk]}</span><p className="mt-2 text-xl font-semibold">{detailQuery.data.riskCounts[risk] ?? 0}건</p></div>)}</div>

      <div><h2 className="text-xl font-semibold">검출 메시지</h2><p className="mt-2 text-sm text-muted">목록에는 원문이 노출되지 않으며 이 상세 화면에서만 확인할 수 있습니다.</p></div>
      {detailQuery.data.evidences.length === 0 ? <div className="card grid min-h-52 place-items-center p-8 text-sm text-muted">검출된 메시지가 없습니다.</div> : <div className="space-y-4">{detailQuery.data.evidences.map((evidence) => <article key={evidence.messageId} className="card p-6"><div className="flex flex-wrap items-center gap-2"><ShieldAlert size={18} className="text-red-600" /><span className={`rounded-full px-3 py-1 text-xs font-semibold ${riskClass[evidence.riskLevel]}`}>위험도 {riskLabel[evidence.riskLevel]}</span>{evidence.categories.map((category) => <span key={category} className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">{categoryLabel[category]}</span>)}{evidence.countedForReview && <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">검토 횟수 포함</span>}</div><blockquote className="mt-5 whitespace-pre-wrap break-words rounded-2xl border border-line bg-surface p-5 leading-7">{evidence.content}</blockquote><div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted"><span>메시지 #{evidence.messageId}</span><span>전송 {formatDateTime(evidence.sentAt)}</span><span>분석 {formatDateTime(evidence.analyzedAt)}</span></div></article>)}</div>}
    </div>}
  </section>
}
