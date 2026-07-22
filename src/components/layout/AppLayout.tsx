import { Menu, UserRound, Utensils } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

const nav = [{ to: '/', label: '홈' }, { to: '/restaurants', label: '식당 찾기' }, { to: '/reservations', label: '내 예약' }]

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const role = useAuthStore((state) => state.role)
  return <div className="min-h-screen bg-white">
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="page-container flex h-18 items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight"><span className="grid size-9 place-items-center rounded-xl bg-brand text-white"><Utensils size={19} /></span>밥풀</Link>
        <nav className="hidden items-center gap-1 md:flex">{nav.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => cn('rounded-full px-4 py-2 text-sm font-medium', isActive ? 'bg-surface text-ink' : 'text-muted hover:text-ink')}>{item.label}</NavLink>)}</nav>
        <div className="hidden items-center gap-2 md:flex">{role === 'owner' && <Link to="/owner" className="px-3 py-2 text-sm font-medium text-brand">식당 관리</Link>}<Link to="/login" className="flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium"><UserRound size={16} /> 로그인</Link></div>
        <button className="rounded-lg p-2 md:hidden" aria-label="메뉴 열기" onClick={() => setOpen((value) => !value)}><Menu /></button>
      </div>
      {open && <nav className="page-container flex flex-col border-t py-3 md:hidden">{nav.map((item) => <Link key={item.to} to={item.to} className="py-3 text-sm" onClick={() => setOpen(false)}>{item.label}</Link>)}{role === 'owner' && <Link to="/owner" className="py-3 text-sm text-brand" onClick={() => setOpen(false)}>식당 관리</Link>}<Link to="/login" className="py-3 text-sm text-brand">로그인</Link></nav>}
    </header>
    <main><Outlet /></main>
    <footer className="mt-16 border-t border-line bg-surface"><div className="page-container flex flex-col gap-3 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between"><p>© 2026 Bobfull. 함께 먹는 즐거움.</p><div className="flex gap-5">{role === 'owner' && <Link to="/owner">식당 관리</Link>}<span>API 상태: Mock</span></div></div></footer>
  </div>
}
