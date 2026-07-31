import { useQuery } from '@tanstack/react-query'
import { CreditCard, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  paymentHistoryApi,
  type PaymentStatus,
  type RefundStatus,
} from '@/features/mypage/api/paymentHistoryApi'
import { useAuthStore } from '@/stores/authStore'
import { cn, formatDateTime } from '@/lib/utils'

const paymentStatusLabel: Record<PaymentStatus, string> = {
  READY: '결제 대기',
  PAID: '결제 완료',
  EXPIRED: '만료됨',
  FAILED: '결제 실패',
  CANCELLED: '취소됨',
}

const refundStatusLabel: Record<RefundStatus, string> = {
  REQUESTED: '환불 요청됨',
  PROCESSING: '환불 처리 중',
  COMPLETED: '환불 완료',
  FAILED: '환불 실패',
}

const purposeLabel = { CREATE: '최초 예약', JOIN: '모임 참여' } as const

function formatAmount(amount: number, currency: string) {
  return `${amount.toLocaleString()}${currency === 'KRW' ? '원' : ` ${currency}`}`
}

const tabs = [
  { key: 'payments', label: '결제 내역', icon: CreditCard },
  { key: 'refunds', label: '환불 내역', icon: RotateCcw },
] as const

export function PaymentHistoryPage() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const [tab, setTab] = useState<(typeof tabs)[number]['key']>('payments')

  const paymentsQuery = useQuery({
    queryKey: ['members', 'me', 'payments'],
    queryFn: () => paymentHistoryApi.getMyPayments(),
    enabled: Boolean(accessToken) && tab === 'payments',
  })
  const refundsQuery = useQuery({
    queryKey: ['members', 'me', 'refunds'],
    queryFn: () => paymentHistoryApi.getMyRefunds(),
    enabled: Boolean(accessToken) && tab === 'refunds',
  })

  if (!accessToken) return <Navigate to="/login" replace />

  const payments = paymentsQuery.data ?? []
  const refunds = refundsQuery.data ?? []
  const activeQuery = tab === 'payments' ? paymentsQuery : refundsQuery

  return <section className="page-container page-section max-w-4xl">
    <PageHeader eyebrow="MY PAGE" title="결제·환불 내역" description="예약을 위해 결제한 내역과 환불 처리 현황을 확인할 수 있습니다." />

    <div className="mb-6 inline-flex rounded-2xl border border-line bg-white p-1">
      {tabs.map((item) => <button
        key={item.key}
        type="button"
        onClick={() => setTab(item.key)}
        className={cn(
          'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition',
          tab === item.key ? 'bg-brand text-white' : 'text-muted hover:text-ink',
        )}
      ><item.icon size={16} />{item.label}</button>)}
    </div>

    {activeQuery.isLoading && <div className="card grid min-h-64 place-items-center p-8 text-sm text-muted">불러오는 중입니다.</div>}

    {activeQuery.isError && <div className="card p-8 text-center">
      <p className="font-semibold">내역을 불러오지 못했습니다.</p>
      <p className="mt-2 text-sm text-muted">로그인 상태와 백엔드 서버 연결을 확인해주세요.</p>
    </div>}

    {!activeQuery.isLoading && !activeQuery.isError && tab === 'payments' && (payments.length === 0
      ? <EmptyState title="결제 내역이 없습니다" description="예약을 진행하면 결제 내역이 이곳에 표시됩니다." />
      : <div className="grid gap-4">{payments.map((item) => <article key={item.paymentId} className="card flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-active">{paymentStatusLabel[item.paymentStatus]}</span>
          <p className="mt-3 text-lg font-semibold">{formatAmount(item.amount, item.currency)}</p>
          <p className="mt-1 text-sm text-muted">{purposeLabel[item.paymentPurpose]} · {item.partySize}명</p>
        </div>
        <p className="text-sm text-muted">{item.paidAt ? formatDateTime(item.paidAt) : '결제 미완료'}</p>
      </article>)}</div>)}

    {!activeQuery.isLoading && !activeQuery.isError && tab === 'refunds' && (refunds.length === 0
      ? <EmptyState title="환불 내역이 없습니다" description="예약을 취소하면 환불 내역이 이곳에 표시됩니다." />
      : <div className="grid gap-4">{refunds.map((item) => <article key={item.refundId} className="card flex flex-col gap-3 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-active">{refundStatusLabel[item.refundStatus]}</span>
          <p className="mt-3 text-lg font-semibold">{item.amount.toLocaleString()}원</p>
          <p className="mt-1 text-sm text-muted">결제 ID {item.paymentId}</p>
        </div>
        <div className="space-y-1 text-sm text-muted">
          <p>요청일 {item.requestedAt ? formatDateTime(item.requestedAt) : '-'}</p>
          <p>완료일 {item.completedAt ? formatDateTime(item.completedAt) : '-'}</p>
        </div>
      </article>)}</div>)}
  </section>
}
