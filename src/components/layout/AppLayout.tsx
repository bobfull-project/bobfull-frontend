import { CreditCard, LogOut, Menu, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { usePortOnePayment } from '@/features/payments/hooks/usePortOnePayment'
import { apiConfig } from '@/lib/api/config'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { apiClient } from '@/lib/api/client'
import { BrandLogo } from '@/components/brand/BrandLogo'

const nav = [{ to: '/', label: '홈' }, { to: '/restaurants', label: '식당 찾기' }, { to: '/recruiting', label: '모집중' }, { to: '/reservations', label: '내 예약' }]

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const role = useAuthStore((state) => state.role)
  const accessToken = useAuthStore((state) => state.accessToken)
  const clearSession = useAuthStore((state) => state.clearSession)
  const { pay: openTestPayment, isProcessing: isTestPaymentProcessing } = usePortOnePayment()
  const logout = async () => {
    try { await apiClient.post('/auth/logout') } catch { /* 로컬 세션은 항상 종료한다. */ }
    clearSession()
    setOpen(false)
  }
  const testPayment = async () => {
    const outcome = await openTestPayment({
      // KG이니시스는 주문번호(oid)를 1~40자로 제한하므로 짧게 생성한다.
      paymentId: `bf-test-${Date.now()}`,
      orderName: '밥풀 KG이니시스 결제 테스트',
      totalAmount: 1000,
      currency: 'KRW',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    })
    if (outcome.status === 'SUCCESS') window.alert('PortOne 테스트 결제가 완료되었습니다.')
    if (outcome.status === 'FAILED') window.alert(outcome.message)
  }
  return <div className="min-h-screen bg-canvas">
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="page-container flex h-18 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Link to="/" aria-label="밥풀 홈"><BrandLogo subtitle="제주 합석 한 끼" subtitleClassName="hidden sm:inline" /></Link>
          {apiConfig.useMock && <button type="button" onClick={testPayment} disabled={isTestPaymentProcessing} className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-brand transition hover:bg-brand-soft disabled:opacity-50" title="예약과 무관한 PortOne KG이니시스 테스트 결제창을 엽니다."><CreditCard size={14} /><span className="hidden sm:inline">{isTestPaymentProcessing ? '결제창 여는 중' : 'KG이니시스 결제 테스트'}</span><span className="sm:hidden">결제 테스트</span></button>}
        </div>
        <nav className="hidden items-center gap-1 md:flex">{nav.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => cn('border-b px-4 py-2 text-sm font-medium transition', isActive ? 'border-brand text-ink' : 'border-transparent text-muted hover:text-ink')}>{item.label}</NavLink>)}</nav>
        <div className="hidden items-center gap-2 md:flex">
          {role === 'owner' && <Link to="/owner" className="px-3 py-2 text-sm font-medium text-brand">식당 관리</Link>}
          {accessToken && <Link to="/mypage" className="px-3 py-2 text-sm font-medium text-ink">내 정보</Link>}
          {role === 'admin' && <Link to="/admin" className="px-3 py-2 text-sm font-medium text-brand">관리자</Link>}
          {accessToken
            ? <button type="button" onClick={logout} className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-brand/40"><LogOut size={16} /> 로그아웃</button>
            : <Link to="/login" className="flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-brand/40"><UserRound size={16} /> 로그인</Link>}
        </div>
        <button className="rounded-lg p-2 md:hidden" aria-label="메뉴 열기" onClick={() => setOpen((value) => !value)}><Menu /></button>
      </div>
      {open && <nav className="page-container flex flex-col border-t py-3 md:hidden">
        {nav.map((item) => <Link key={item.to} to={item.to} className="py-3 text-sm" onClick={() => setOpen(false)}>{item.label}</Link>)}
        {role === 'owner' && <Link to="/owner" className="py-3 text-sm text-brand" onClick={() => setOpen(false)}>식당 관리</Link>}
        {accessToken && <Link to="/mypage" className="py-3 text-sm" onClick={() => setOpen(false)}>내 정보</Link>}
        {accessToken
          ? <button type="button" className="py-3 text-left text-sm text-brand" onClick={logout}>로그아웃</button>
          : <Link to="/login" className="py-3 text-sm text-brand" onClick={() => setOpen(false)}>로그인</Link>}
      </nav>}
    </header>
    <main><Outlet /></main>
    <footer className="mt-16 border-t border-line bg-canvas"><div className="page-container flex flex-col gap-5 py-10 text-sm text-muted md:flex-row md:items-end md:justify-between"><div><Link to="/" aria-label="밥풀 홈"><BrandLogo imageClassName="size-8" /></Link><p className="mt-2">혼자 온 제주 여행객들을 한 테이블로 잇습니다.</p></div><div className="flex gap-5">{role === 'owner' && <Link to="/owner">식당 관리</Link>}<span>API 상태: {apiConfig.useMock ? 'Mock' : 'Live'}</span></div></div></footer>
  </div>
}
