import { Bell, ChevronRight, LogOut, Settings, UserRound } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'

export function MyPage() {
  return <section className="page-container page-section max-w-4xl"><PageHeader eyebrow="MY PAGE" title="마이페이지" /><div className="card flex items-center gap-5 p-6"><span className="grid size-16 place-items-center rounded-full bg-brand-soft text-brand"><UserRound size={28} /></span><div><h2 className="text-lg font-semibold">밥풀 사용자</h2><p className="mt-1 text-sm text-muted">user@bobfull.kr</p></div><Button variant="secondary" className="ml-auto hidden sm:flex">프로필 수정</Button></div><div className="card mt-5 divide-y">{[{ icon: Bell, label: '알림 설정' }, { icon: Settings, label: '계정 설정' }, { icon: LogOut, label: '로그아웃' }].map((item) => <button key={item.label} className="flex w-full items-center gap-3 p-5 text-left text-sm"><item.icon size={18} className="text-muted" /><span>{item.label}</span><ChevronRight size={17} className="ml-auto text-muted" /></button>)}</div></section>
}
