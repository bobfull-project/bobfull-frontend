import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ChevronRight, ClipboardCheck, Flag } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { moderationReportApi, type ReportStatus } from '@/features/admin/api/moderationReportApi'
import type { ChatReportReason } from '@/features/chat/api/chatApi'
import { formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const reasonLabel: Record<ChatReportReason, string> = { ABUSE: '욕설·괴롭힘', SPAM: '스팸', PERSONAL_INFORMATION: '개인정보', OTHER: '기타' }
const filters: Array<{ label: string; value: ReportStatus | undefined }> = [{ label: '검토 대기', value: 'PENDING' }, { label: '전체', value: undefined }, { label: '검토 완료', value: 'REVIEWED' }]

export function AdminModerationReportsPage() {
  const role = useAuthStore((state) => state.role)
  const [status, setStatus] = useState<ReportStatus | undefined>('PENDING')
  const reports = useQuery({ queryKey: ['admin', 'moderation', 'reports', status ?? 'ALL'], queryFn: () => moderationReportApi.getReports(status), enabled: role === 'admin' })
  if (role !== 'admin') return <Navigate to="/" replace />
  return <section className="page-container page-section"><div className="mb-4"><Link to="/admin" className="text-sm font-semibold text-brand">← 운영 관리로</Link></div><PageHeader eyebrow="HUMAN REVIEW" title="사용자 신고 검토" description="사용자가 신고한 채팅과 주변 문맥을 확인하고 위반 여부를 판단합니다." />
    <div className="mb-6 flex flex-wrap gap-2">{filters.map((filter) => <button key={filter.label} type="button" onClick={() => setStatus(filter.value)} className={`rounded-full px-4 py-2 text-sm font-semibold ${status === filter.value ? 'bg-brand text-white' : 'bg-surface text-muted'}`}>{filter.label}</button>)}</div>
    {reports.isLoading && <div className="card grid min-h-64 place-items-center text-sm text-muted">신고 목록을 불러오는 중입니다.</div>}
    {reports.isError && <div className="card p-8 text-center"><AlertTriangle className="mx-auto text-red-600" /><p className="mt-4 font-semibold">신고 목록을 불러오지 못했습니다.</p><Button variant="secondary" className="mt-5" onClick={() => reports.refetch()}>다시 시도</Button></div>}
    {reports.isSuccess && reports.data.content.length === 0 && <div className="card grid min-h-64 place-items-center text-center"><div><ClipboardCheck className="mx-auto text-brand" size={36} /><p className="mt-4 font-semibold">해당하는 신고가 없습니다.</p></div></div>}
    {reports.data && <div className="grid gap-4">{reports.data.content.map((report) => <Link key={report.reportId} to={`/admin/moderation/reports/${report.reportId}`} className="card flex flex-col gap-4 p-6 transition hover:-translate-y-0.5 hover:shadow-card md:flex-row md:items-center"><span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${report.status === 'PENDING' ? 'bg-red-50 text-red-600' : 'bg-brand-soft text-brand'}`}><Flag /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">신고 #{report.reportId}</h2><span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold">{reasonLabel[report.reason]}</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${report.status === 'PENDING' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{report.status === 'PENDING' ? '검토 대기' : '검토 완료'}</span></div><p className="mt-2 text-sm text-muted">신고자 #{report.reporterMemberId} → 대상 #{report.reportedMemberId} · {formatDateTime(report.createdAt)}</p></div>{report.decision && <strong className="text-sm">{report.decision === 'VIOLATION_CONFIRMED' ? '위반 확인' : '위반 아님'}</strong>}<ChevronRight className="shrink-0 text-muted" /></Link>)}</div>}
  </section>
}
