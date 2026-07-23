import { Building2, LogOut, Utensils } from 'lucide-react'
import { Link, Navigate, NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'

export function OwnerLayout() {
  const role = useAuthStore((state) => state.role)
  if (role !== 'owner') return <Navigate to="/owner/login" replace />

  return <div className="min-h-screen bg-surface md:grid md:grid-cols-[240px_1fr]">
    <aside className="border-b border-line bg-white p-5 md:min-h-screen md:border-b-0 md:border-r"><Link to="/" className="mb-8 flex items-center gap-2 text-xl font-bold"><span className="grid size-9 place-items-center rounded-xl bg-brand text-white"><Utensils size={18} /></span>밥풀 사장님</Link><nav className="flex gap-2 md:flex-col"><NavLink to="/owner/restaurants" className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium', isActive ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-surface')}><Building2 size={18} />내 식당</NavLink></nav><Link to="/" className="mt-8 hidden items-center gap-3 px-4 py-3 text-sm text-muted md:flex"><LogOut size={18} />사용자 화면</Link></aside>
    <main className="min-w-0 p-5 md:p-10"><Outlet /></main>
  </div>
}
