import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { moderationReportApi, type ReviewDecision } from '@/features/admin/api/moderationReportApi'
import type { ModerationCategory } from '@/features/admin/api/moderationApi'
import type { ChatReportReason } from '@/features/chat/api/chatApi'
import { formatDateTime } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const reasonLabel: Record<ChatReportReason, string> = { ABUSE: '욕설·괴롭힘', SPAM: '스팸', PERSONAL_INFORMATION: '개인정보 노출', OTHER: '기타' }
const categoryLabel: Record<ModerationCategory, string> = { PROFANITY: '욕설', PERSONAL_INFORMATION: '개인정보', SPAM: '스팸' }

export function AdminModerationReportDetailPage() {
  const role = useAuthStore((state) => state.role)
  const reportId = Number(useParams().reportId)
  const queryClient = useQueryClient()
  const report = useQuery({ queryKey: ['admin', 'moderation', 'reports', reportId], queryFn: () => moderationReportApi.getReport(reportId), enabled: role === 'admin' && Number.isFinite(reportId) })
  const review = useMutation({ mutationFn: (decision: ReviewDecision) => moderationReportApi.reviewReport(reportId, decision), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['admin', 'moderation', 'reports'] }); await report.refetch() } })
  if (role !== 'admin') return <Navigate to="/" replace />
  if (!Number.isFinite(reportId)) return <Navigate to="/admin/moderation/reports" replace />
  return <section className="page-container page-section"><div className="mb-4"><Link to="/admin/moderation/reports" className="text-sm font-semibold text-brand">← 신고 목록으로</Link></div><PageHeader eyebrow="REPORT DETAIL" title={`신고 #${reportId}`} description="신고 메시지 주변 문맥과 AI 분석 신호를 함께 확인한 후 사람이 최종 판단합니다." />
    {report.isLoading && <div className="card grid min-h-64 place-items-center text-sm text-muted">신고 상세를 불러오는 중입니다.</div>}
    {report.isError && <div className="card p-8 text-center"><AlertTriangle className="mx-auto text-red-600" /><p className="mt-4 font-semibold">신고 상세를 불러오지 못했습니다.</p><Button variant="secondary" className="mt-5" onClick={() => report.refetch()}>다시 시도</Button></div>}
    {report.data && <div className="space-y-6"><div className="card grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4"><p><span className="text-xs text-muted">신고 사유</span><br /><strong>{reasonLabel[report.data.reason]}</strong></p><p><span className="text-xs text-muted">신고자 → 대상</span><br /><strong>#{report.data.reporterMemberId} → #{report.data.reportedMemberId}</strong></p><p><span className="text-xs text-muted">신고 시각</span><br /><strong>{formatDateTime(report.data.createdAt)}</strong></p><p><span className="text-xs text-muted">상태</span><br /><strong>{report.data.status === 'PENDING' ? '검토 대기' : '검토 완료'}</strong></p>{report.data.detail && <p className="md:col-span-2 lg:col-span-4"><span className="text-xs text-muted">신고 상세</span><br /><span className="mt-2 block rounded-2xl bg-surface p-4">{report.data.detail}</span></p>}</div>
      <div className="card grid gap-4 p-6 sm:grid-cols-3 lg:grid-cols-6"><p><span className="text-xs text-muted">AI 전체 검출</span><br /><strong>{report.data.moderationSignals.totalFlaggedCount}건</strong></p><p><span className="text-xs text-muted">AI 검토 대상</span><br /><strong>{report.data.moderationSignals.reviewTargetCount}건</strong></p><p><span className="text-xs text-muted">욕설</span><br /><strong>{report.data.moderationSignals.profanityCount}건</strong></p><p><span className="text-xs text-muted">대기 신고</span><br /><strong>{report.data.reportSignals.pendingReportCount}건</strong></p><p><span className="text-xs text-muted">검토 완료</span><br /><strong>{report.data.reportSignals.reviewedReportCount}건</strong></p><p><span className="text-xs text-muted">위반 확정</span><br /><strong>{report.data.reportSignals.confirmedViolationCount}건</strong></p></div>
      <div><h2 className="text-xl font-semibold">주변 대화</h2><p className="mt-2 text-sm text-muted">테두리가 강조된 메시지가 신고 기준 메시지입니다.</p></div><div className="space-y-3">{report.data.context.map((message) => <article key={message.messageId} className={`card p-5 ${message.messageId === report.data.anchorMessageId ? 'border-red-300 ring-2 ring-red-100' : ''}`}><div className="flex flex-wrap items-center gap-2"><strong>회원 #{message.senderMemberId}</strong>{message.messageId === report.data.anchorMessageId && <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">신고 메시지</span>}{message.moderation?.status === 'FLAGGED' && <><ShieldAlert size={16} className="text-red-600" />{message.moderation.categories.map((category) => <span key={category} className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-700">{categoryLabel[category]}</span>)}</>}</div><p className="mt-3 whitespace-pre-wrap break-words rounded-2xl bg-surface p-4 leading-7">{message.content}</p><p className="mt-2 text-xs text-muted">메시지 #{message.messageId} · {formatDateTime(message.sentAt)}</p></article>)}</div>
      {review.isError && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">검토 결과를 저장하지 못했습니다.</p>}{report.data.status === 'PENDING' ? <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-semibold">최종 판단</h2><p className="mt-1 text-sm text-muted">AI 신호만으로 판단하지 말고 주변 대화를 함께 확인해주세요.</p></div><div className="flex gap-3"><Button variant="secondary" disabled={review.isPending} onClick={() => review.mutate('NO_VIOLATION')}>위반 아님</Button><Button disabled={review.isPending} onClick={() => review.mutate('VIOLATION_CONFIRMED')}>위반 확인</Button></div></div> : <div className="card flex items-center gap-3 p-6 text-green-700"><CheckCircle2 /><strong>관리자 검토가 완료된 신고입니다.</strong></div>}
    </div>}
  </section>
}
