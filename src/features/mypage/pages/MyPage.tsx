import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { memberRepository, type MemberProfile } from '@/features/mypage/api/memberRepository'
import { useAuthStore } from '@/stores/authStore'

const profileSchema = z.object({
  name: z.string().trim().min(1, '이름을 입력해주세요.').max(50, '이름은 50자 이하여야 합니다.'),
  phoneNumber: z.string().trim().min(1, '전화번호를 입력해주세요.').max(20, '전화번호는 20자 이하여야 합니다.'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

function apiErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  return '내 정보 수정에 실패했습니다. 잠시 후 다시 시도해주세요.'
}

const roleLabel: Record<MemberProfile['role'], string> = {
  MEMBER: '일반 회원',
  OWNER: '사장님',
  ADMIN: '관리자',
}

export function MyPage() {
  const accessToken = useAuthStore((state) => state.accessToken)
  const setUserName = useAuthStore((state) => state.setUserName)
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const profileQuery = useQuery({
    queryKey: ['member', 'me'],
    queryFn: memberRepository.getMe,
    enabled: Boolean(accessToken),
  })
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', phoneNumber: '' },
  })

  useEffect(() => {
    if (profileQuery.data) {
      reset({ name: profileQuery.data.name, phoneNumber: profileQuery.data.phoneNumber })
    }
  }, [profileQuery.data, reset])

  const updateMutation = useMutation({
    mutationFn: memberRepository.updateMe,
    onSuccess: async (_, values) => {
      setUserName(values.name)
      await queryClient.invalidateQueries({ queryKey: ['member', 'me'] })
      setEditing(false)
      setSaved(true)
    },
  })

  if (!accessToken) return <Navigate to="/login" replace />

  const profile = profileQuery.data
  const cancelEditing = () => {
    if (profile) reset({ name: profile.name, phoneNumber: profile.phoneNumber })
    setEditing(false)
  }

  return <section className="page-container page-section max-w-4xl">
    <PageHeader eyebrow="MY PAGE" title="내 정보" description="가입 정보를 조회하고 이름과 전화번호를 수정할 수 있습니다." />

    {profileQuery.isLoading && <div className="card grid min-h-64 place-items-center p-8 text-sm text-muted">내 정보를 불러오는 중입니다.</div>}

    {profileQuery.isError && <div className="card p-8 text-center">
      <p className="font-semibold">내 정보를 불러오지 못했습니다.</p>
      <p className="mt-2 text-sm text-muted">로그인 상태와 백엔드 서버 연결을 확인해주세요.</p>
      <Button variant="secondary" className="mt-5" onClick={() => profileQuery.refetch()}>다시 시도</Button>
    </div>}

    {profile && <div className="space-y-5">
      <div className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-brand-soft text-brand"><UserRound size={28} /></span>
        <div className="min-w-0"><h2 className="text-lg font-semibold">{profile.name}</h2><p className="mt-1 truncate text-sm text-muted">{profile.email}</p><span className="mt-2 inline-block rounded-full bg-sub-soft px-3 py-1 text-xs font-semibold text-brand">{roleLabel[profile.role]}</span></div>
        {!editing && <Button variant="secondary" className="sm:ml-auto" onClick={() => { setEditing(true); setSaved(false) }}>내 정보 수정</Button>}
      </div>

      {saved && <p className="flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700"><CheckCircle2 size={17} />내 정보가 수정되었습니다.</p>}

      <form className="card p-6 md:p-8" onSubmit={handleSubmit((values) => updateMutation.mutate(values))}>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block"><span className="label">이메일</span><input className="field bg-surface text-muted" value={profile.email} readOnly /><span className="mt-1 block text-xs text-muted">이메일은 변경할 수 없습니다.</span></label>
          <label className="block"><span className="label">회원 유형</span><input className="field bg-surface text-muted" value={roleLabel[profile.role]} readOnly /></label>
          <label className="block"><span className="label">이름</span><input className={`field ${!editing ? 'bg-surface text-muted' : ''}`} readOnly={!editing} {...register('name')} /><span className="mt-1 block text-xs text-red-700">{errors.name?.message}</span></label>
          <label className="block"><span className="label">전화번호</span><input className={`field ${!editing ? 'bg-surface text-muted' : ''}`} readOnly={!editing} placeholder="01012345678" {...register('phoneNumber')} /><span className="mt-1 block text-xs text-red-700">{errors.phoneNumber?.message}</span></label>
          {profile.businessNumber && <label className="block md:col-span-2"><span className="label">사업자등록번호</span><input className="field bg-surface text-muted" value={profile.businessNumber} readOnly /><span className="mt-1 block text-xs text-muted">사업자등록번호는 이 화면에서 변경할 수 없습니다.</span></label>}
        </div>

        {updateMutation.isError && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{apiErrorMessage(updateMutation.error)}</p>}

        {editing && <div className="mt-7 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={cancelEditing} disabled={updateMutation.isPending}>취소</Button>
          <Button type="submit" disabled={updateMutation.isPending || !isDirty}>{updateMutation.isPending ? '저장 중...' : '변경사항 저장'}</Button>
        </div>}
      </form>
    </div>}
  </section>
}
