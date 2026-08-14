import { ArrowUpRight, Building2 } from 'lucide-react'
import { Link, Navigate, NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { BrandLogo } from '@/components/brand/BrandLogo'

export function OwnerLayout() {
  const role = useAuthStore((state) => state.role)
  if (role !== 'owner') return <Navigate to="/owner/login" replace />

  return <div className="owner-shell min-h-screen bg-canvas md:grid md:grid-cols-[248px_1fr]">
    <aside className="border-b border-line bg-[#fffdf8] px-5 py-5 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:border-b-0 md:border-r md:px-6 md:py-7">
      <Link to="/" className="mb-8" aria-label="밥풀 홈"><BrandLogo subtitle="사장님" /></Link>
      <p className="mb-3 hidden text-[11px] font-semibold tracking-[.16em] text-muted md:block">RESTAURANT</p>
      <nav className="flex gap-2 md:flex-col"><NavLink to="/owner/restaurants" className={({ isActive }) => cn('flex items-center gap-3 border-l-2 px-4 py-3 text-sm font-semibold transition-colors', isActive ? 'border-[#627d55] bg-[#f1f5ed] text-[#4f6945]' : 'border-transparent text-muted hover:bg-[#faf7f0] hover:text-ink')}><Building2 size={17} />내 식당</NavLink></nav>
      <Link to="/" className="mt-8 hidden items-center justify-between border-t border-line px-1 pt-5 text-sm text-muted transition-colors hover:text-ink md:flex">사용자 화면 보기<ArrowUpRight size={16} /></Link>
      <p className="mt-auto hidden text-xs leading-5 text-muted md:block">식당과 예약 가능 시간을<br />한곳에서 관리하세요.</p>
    </aside>
    <main className="min-w-0 p-5 md:p-10 lg:p-12"><Outlet /></main>
  </div>
}
