import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { reservationRepository } from '@/features/reservations/api/reservationRepository'
import { reservationSchema, type ReservationFormValues } from '@/features/reservations/schemas'

export function ReservationFormPage() {
  const restaurantId = Number(useParams().restaurantId)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<ReservationFormValues>({ resolver: zodResolver(reservationSchema), defaultValues: { capacity: 4, note: '' } })
  const mutation = useMutation({ mutationFn: (values: ReservationFormValues) => reservationRepository.create({ ...values, restaurantId }), onSuccess: () => navigate('/reservations') })
  return <section className="page-container page-section max-w-3xl"><PageHeader eyebrow="NEW MEETING" title="새 밥 모임 만들기" description="백엔드 연동 시 이 폼 데이터가 예약 생성 API 요청으로 전달됩니다." /><form className="card space-y-6 p-6 md:p-8" onSubmit={handleSubmit((values) => mutation.mutate(values))}><label className="block"><span className="label">날짜와 시간</span><input type="datetime-local" className="field" {...register('dateTime')} /><span className="mt-1 block text-xs text-red-700">{errors.dateTime?.message}</span></label><label className="block"><span className="label">모집 인원</span><input type="number" min="2" max="10" className="field" {...register('capacity', { valueAsNumber: true })} /><span className="mt-1 block text-xs text-red-700">{errors.capacity?.message}</span></label><label className="block"><span className="label">모임 소개</span><textarea rows={5} className="field h-auto py-4" placeholder="어떤 식사 모임인지 간단히 알려주세요." {...register('note')} /><span className="mt-1 block text-xs text-red-700">{errors.note?.message}</span></label><div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={() => navigate(-1)}>취소</Button><Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? '생성 중...' : '모임 만들기'}</Button></div></form></section>
}
