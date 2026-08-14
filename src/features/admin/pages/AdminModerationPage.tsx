import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ChevronRight, MessageSquareWarning, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { moderationApi, type ModerationReviewStatus } from '@/features/admin/api/moderationApi'
import { formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const filters: Array<{ label: string; value: ModerationReviewStatus | undefined }> = [
  { label: '검토 필요', value: 'REVIEW_REQUIRED' },
  { label: '전체', value: undefined },
  { label: '정상', value: 'NORMAL' },
]

export function AdminModerationPage() {
  const role = useAuthStore((state) => state.role)
  const [status, setStatus] = useState<ModerationReviewStatus | undefined>('REVIEW_REQUIRED')
  const membersQuery = useQuery({
    queryKey: ['admin', 'moderation', 'members', status ?? 'ALL'],
    queryFn: () => moderationApi.getMembers(status),
    enabled: role === 'admin',
  })

  if (role !== 'admin') return <Navigate to="/" replace />

  return <section className="page-container page-section">
    <div className="mb-4"><Link to="/admin" className="text-sm font-semibold text-brand">← 운영 관리로</Link></div>
    <PageHeader eyebrow="AI MODERATION" title="AI 채팅 검열" description="AI가 탐지한 위험 신호를 회원별로 확인합니다. 검열 결과는 관리자 검토를 돕는 자료이며 자동 제재를 의미하지 않습니다." />
    <div className="mb-6"><Link to="/admin/moderation/reports" className="text-sm font-semibold text-brand">사용자 신고 검토로 이동 →</Link></div>

    <div className="mb-6 flex flex-wrap gap-2">{filters.map((filter) => <button key={filter.label} type="button" onClick={() => setStatus(filter.value)} className={`rounded-full px-4 py-2 text-sm font-semibold ${status === filter.value ? 'bg-brand text-white' : 'bg-surface text-muted'}`}>{filter.label}</button>)}</div>

    {membersQuery.isLoading && <div className="card grid min-h-64 place-items-center p-8 text-sm text-muted">검열 결과를 불러오는 중입니다.</div>}
    {membersQuery.isError && <div className="card p-8 text-center"><AlertTriangle className="mx-auto text-red-600" /><p className="mt-4 font-semibold">검열 결과를 불러오지 못했습니다.</p><p className="mt-2 text-sm text-muted">관리자 권한과 백엔드 연결 상태를 확인해주세요.</p><Button variant="secondary" className="mt-5" onClick={() => membersQuery.refetch()}>다시 시도</Button></div>}
    {membersQuery.isSuccess && membersQuery.data.content.length === 0 && <div className="card grid min-h-64 place-items-center p-8 text-center"><div><ShieldCheck className="mx-auto text-brand" size={36} /><p className="mt-4 font-semibold">해당하는 회원이 없습니다.</p><p className="mt-2 text-sm text-muted">현재 필터 조건에 맞는 검열 결과가 없습니다.</p></div></div>}

    {membersQuery.data && membersQuery.data.content.length > 0 && <div className="grid gap-4">{membersQuery.data.content.map((member) => {
      const reviewRequired = member.reviewStatus === 'REVIEW_REQUIRED'
      return <Link key={member.memberId} to={`/admin/moderation/members/${member.memberId}`} className="card flex flex-col gap-5 p-6 transition hover:-translate-y-0.5 hover:shadow-card lg:flex-row lg:items-center">
        <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${reviewRequired ? 'bg-red-50 text-red-600' : 'bg-brand-soft text-brand'}`}>{reviewRequired ? <MessageSquareWarning /> : <ShieldCheck />}</span>
        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">회원 #{member.memberId}</h2><span className={`rounded-full px-3 py-1 text-xs font-semibold ${reviewRequired ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{reviewRequired ? '검토 필요' : '정상'}</span></div><p className="mt-2 text-sm text-muted">마지막 검출 {formatDateTime(member.lastFlaggedAt)}</p></div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-5"><p><span className="text-xs text-muted">욕설</span><br /><strong>{member.profanityCount}건</strong></p><p><span className="text-xs text-muted">개인정보</span><br /><strong>{member.personalInformationCount}건</strong></p><p><span className="text-xs text-muted">스팸</span><br /><strong>{member.spamCount}건</strong></p><p><span className="text-xs text-muted">전체 검출</span><br /><strong>{member.totalFlaggedCount}건</strong></p><p><span className="text-xs text-muted">검토 대상</span><br /><strong className={reviewRequired ? 'text-red-700' : ''}>{member.reviewTargetCount}건</strong></p></div>
        <ChevronRight className="hidden shrink-0 text-muted lg:block" />
      </Link>
    })}</div>}
  </section>
}
