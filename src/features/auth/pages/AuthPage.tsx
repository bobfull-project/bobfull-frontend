import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Utensils } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'

const schema = z.object({ email: z.email('올바른 이메일을 입력해주세요.'), password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'), name: z.string().optional() })
type Values = z.infer<typeof schema>

export function AuthPage({ mode, audience }: { mode: 'login' | 'signup'; audience: 'member' | 'owner' }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) })
  const onSubmit = (values: Values) => { setSession('mock-access-token', values.name || (audience === 'owner' ? '사장님' : '밥풀 사용자'), audience); navigate(audience === 'owner' ? '/owner' : '/') }
  return <main className="grid min-h-screen bg-canvas lg:grid-cols-2"><section className="hidden bg-brand p-14 text-white lg:flex lg:flex-col lg:justify-between"><Link to="/" className="flex items-center gap-2 text-xl font-bold"><Utensils className="text-accent" />밥풀</Link><div><p className="text-sm text-white/55">BOBFULL</p><h1 className="mt-4 text-5xl font-semibold leading-tight">좋은 식사는<br />좋은 만남이 됩니다.</h1><p className="mt-5 max-w-md leading-7 text-white/60">식당과 사람을 자연스럽게 연결하는 가장 간단한 방법.</p></div><p className="text-sm text-white/40">MVP API test client</p></section><section className="flex items-center justify-center p-5"><div className="w-full max-w-md"><Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm text-muted"><ArrowLeft size={16} />홈으로</Link><p className="text-sm font-semibold text-brand">{audience === 'owner' ? '사장님 전용' : '밥풀 시작하기'}</p><h2 className="mt-2 text-3xl font-semibold">{isSignup ? '회원가입' : '로그인'}</h2><p className="mt-3 text-sm text-muted">{isSignup ? '기본 정보만 입력하면 바로 시작할 수 있어요.' : '계정에 로그인하고 밥 모임을 확인하세요.'}</p><form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>{isSignup && <label className="block"><span className="label">이름</span><input className="field" placeholder="이름" {...register('name')} /></label>}<label className="block"><span className="label">이메일</span><input type="email" className="field" placeholder="name@example.com" {...register('email')} /><span className="mt-1 block text-xs text-red-700">{errors.email?.message}</span></label><label className="block"><span className="label">비밀번호</span><input type="password" className="field" placeholder="8자 이상" {...register('password')} /><span className="mt-1 block text-xs text-red-700">{errors.password?.message}</span></label><Button fullWidth type="submit">{isSignup ? '가입하기' : '로그인'}</Button></form>{isSignup ? <p className="mt-6 text-center text-sm text-muted">이미 계정이 있나요? <Link className="font-semibold text-ink underline" to={audience === 'owner' ? '/owner/login' : '/login'}>로그인</Link></p> : <div className="mt-6"><p className="mb-3 text-center text-sm text-muted">아직 계정이 없나요?</p><div className="grid grid-cols-2 gap-3"><Link to="/signup"><Button variant="secondary" fullWidth>일반 회원가입</Button></Link><Link to="/owner/signup"><Button variant="secondary" fullWidth>사장님 회원가입</Button></Link></div></div>}</div></section></main>
}
