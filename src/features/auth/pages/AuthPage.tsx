import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Utensils } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { apiClient } from '@/lib/api/client'
import { useAuthStore } from '@/stores/authStore'

interface LoginResponse { accessToken: string; tokenType: string }
interface SignupResponse { memberId: number; email: string; name: string; role: 'MEMBER' | 'OWNER' | 'ADMIN' }
interface MemberResponse { memberId: number; email: string; name: string; role: 'MEMBER' | 'OWNER' | 'ADMIN' }

function toApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  return fallback
}

const createSchema = (mode: 'login' | 'signup', audience: 'member' | 'owner') => z.object({
  email: z.email('올바른 이메일을 입력해주세요.'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다.'),
  name: z.string().max(50).optional(),
  phoneNumber: z.string().max(20).optional(),
  businessNumber: z.string().max(20).optional(),
}).superRefine((values, context) => {
  if (mode !== 'signup') return
  if (!values.name?.trim()) context.addIssue({ code: 'custom', path: ['name'], message: '이름을 입력해주세요.' })
  if (!values.phoneNumber?.match(/^[0-9-]{10,20}$/)) context.addIssue({ code: 'custom', path: ['phoneNumber'], message: '전화번호를 입력해주세요.' })
  if (audience === 'owner' && !values.businessNumber?.match(/^[0-9-]{10,20}$/)) context.addIssue({ code: 'custom', path: ['businessNumber'], message: '사업자등록번호를 입력해주세요.' })
})
type Values = z.infer<ReturnType<typeof createSchema>>

export function AuthPage({ mode, audience }: { mode: 'login' | 'signup'; audience: 'member' | 'owner' }) {
  const isSignup = mode === 'signup'
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(createSchema(mode, audience)) })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loginAndSetSession = async (email: string, password: string) => {
    const loginResponse = await apiClient.post<{ data: LoginResponse }>('/auth/login', { email, password })
    const accessToken = loginResponse.data.data.accessToken
    const meResponse = await apiClient.get<{ data: MemberResponse }>('/members/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const me = meResponse.data.data
    setSession(accessToken, me.name, me.role === 'OWNER' ? 'owner' : 'member')
  }

  const onSubmit = async (values: Values) => {
    setSubmitError(null)
    setSubmitting(true)
    try {
      if (isSignup) {
        const path = audience === 'owner' ? '/auth/signup/owners' : '/auth/signup/users'
        const payload = audience === 'owner'
          ? { email: values.email, password: values.password, name: values.name, phoneNumber: values.phoneNumber, businessNumber: values.businessNumber }
          : { email: values.email, password: values.password, name: values.name, phoneNumber: values.phoneNumber }
        await apiClient.post<{ data: SignupResponse }>(path, payload)
      }
      await loginAndSetSession(values.email, values.password)
      navigate(audience === 'owner' ? '/owner' : '/')
    } catch (error) {
      setSubmitError(toApiErrorMessage(error, isSignup ? '가입에 실패했습니다.' : '이메일 또는 비밀번호가 일치하지 않습니다.'))
    } finally {
      setSubmitting(false)
    }
  }

  return <main className="grid min-h-screen bg-canvas lg:grid-cols-2">
    <section className="hidden bg-brand p-14 text-white lg:flex lg:flex-col lg:justify-between">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold"><Utensils className="text-accent" />밥풀</Link>
      <div><p className="text-sm text-white/55">BOBFULL</p><h1 className="mt-4 text-5xl font-semibold leading-tight">좋은 식사는<br />좋은 만남이 됩니다.</h1><p className="mt-5 max-w-md leading-7 text-white/60">식당과 사람을 자연스럽게 연결하는 가장 간단한 방법.</p></div>
      <p className="text-sm text-white/40">MVP API test client</p>
    </section>
    <section className="flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-10 inline-flex items-center gap-2 text-sm text-muted"><ArrowLeft size={16} />홈으로</Link>
        <p className="text-sm font-semibold text-brand">{audience === 'owner' ? '사장님 전용' : '밥풀 시작하기'}</p>
        <h2 className="mt-2 text-3xl font-semibold">{isSignup ? '회원가입' : '로그인'}</h2>
        <p className="mt-3 text-sm text-muted">{isSignup ? '기본 정보만 입력하면 바로 시작할 수 있어요.' : '계정에 로그인하고 예약을 확인하세요.'}</p>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {isSignup && <>
            <label className="block"><span className="label">이름</span><input className="field" placeholder="이름" {...register('name')} /><span className="mt-1 block text-xs text-red-700">{errors.name?.message}</span></label>
            <label className="block"><span className="label">전화번호</span><input className="field" placeholder="010-1234-5678" {...register('phoneNumber')} /><span className="mt-1 block text-xs text-red-700">{errors.phoneNumber?.message}</span></label>
            {audience === 'owner' && <label className="block"><span className="label">사업자등록번호</span><input className="field" placeholder="123-45-67890" {...register('businessNumber')} /><span className="mt-1 block text-xs text-red-700">{errors.businessNumber?.message}</span></label>}
          </>}
          <label className="block"><span className="label">이메일</span><input type="email" className="field" placeholder="name@example.com" {...register('email')} /><span className="mt-1 block text-xs text-red-700">{errors.email?.message}</span></label>
          <label className="block"><span className="label">비밀번호</span><input type="password" className="field" placeholder="8자 이상" {...register('password')} /><span className="mt-1 block text-xs text-red-700">{errors.password?.message}</span></label>
          {submitError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{submitError}</p>}
          <Button fullWidth type="submit" disabled={submitting}>{submitting ? '처리 중...' : isSignup ? '가입하기' : '로그인'}</Button>
        </form>
        {isSignup
          ? <p className="mt-6 text-center text-sm text-muted">이미 계정이 있나요? <Link className="font-semibold text-ink underline" to={audience === 'owner' ? '/owner/login' : '/login'}>로그인</Link></p>
          : <div className="mt-6"><p className="mb-3 text-center text-sm text-muted">아직 계정이 없나요?</p><div className="grid grid-cols-2 gap-3"><Link to="/signup"><Button variant="secondary" fullWidth>일반 회원가입</Button></Link><Link to="/owner/signup"><Button variant="secondary" fullWidth>사장님 회원가입</Button></Link></div></div>}
      </div>
    </section>
  </main>
}
