import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { reservationRepository } from '@/features/reservations/api/reservationRepository'
import { reservationSchema, type ReservationFormValues } from '@/features/reservations/schemas'
import { reservationSlots, restaurants } from '@/mocks/data'
import { formatDateTime } from '@/lib/utils'

export function ReservationFormPage() {
  const restaurantId = Number(useParams().restaurantId)
  const [searchParams] = useSearchParams()
  const slotId = Number(searchParams.get('slotId'))
  const slot = reservationSlots.find((item) => item.id === slotId && item.restaurantId === restaurantId)
  const restaurant = restaurants.find((item) => item.id === restaurantId)
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: { partySize: 1, note: '' },
  })
  const mutation = useMutation({
    mutationFn: (values: ReservationFormValues) => reservationRepository.create({ ...values, restaurantId, slotId }),
    onSuccess: () => navigate('/reservations'),
  })

  if (!slot || !restaurant) return <Navigate to={`/restaurants/${restaurantId}`} replace />

  return <section className="page-container page-section max-w-3xl">
    <PageHeader eyebrow="RESERVATION" title="예약 정보 확인" description="사장님이 등록한 예약 가능 시간에서 좌석을 예약합니다." />
    <form className="card space-y-6 p-6 md:p-8" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <div className="rounded-2xl bg-brand-soft p-5">
        <p className="text-sm font-semibold text-brand">{restaurant.name}</p>
        <p className="mt-2 text-lg font-semibold">{formatDateTime(slot.dateTime)}</p>
        <p className="mt-2 text-sm text-muted">잔여 좌석 {slot.remainingSeats}석 · {slot.tableCapacity}인 테이블</p>
      </div>
      <label className="block">
        <span className="label">예약 인원</span>
        <input type="number" min="1" max={slot.remainingSeats} className="field" {...register('partySize', { valueAsNumber: true, max: slot.remainingSeats })} />
        <span className="mt-1 block text-xs text-muted">최대 {slot.remainingSeats}명까지 예약할 수 있습니다.</span>
        <span className="mt-1 block text-xs text-red-700">{errors.partySize?.message}</span>
      </label>
      <label className="block">
        <span className="label">요청 사항</span>
        <textarea rows={4} className="field h-auto py-4" placeholder="식당에 전달할 요청 사항이 있다면 입력해주세요." {...register('note')} />
        <span className="mt-1 block text-xs text-red-700">{errors.note?.message}</span>
      </label>
      {mutation.isError && <p className="text-sm text-red-700">{mutation.error.message}</p>}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>취소</Button>
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? '예약 중...' : '예약하기'}</Button>
      </div>
    </form>
  </section>
}
