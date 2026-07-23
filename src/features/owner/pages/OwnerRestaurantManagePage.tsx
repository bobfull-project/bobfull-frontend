import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarPlus, Clock3, MapPin, Store, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useParams } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { formatDateTime } from '@/lib/utils'
import { useOwnerRestaurantStore } from '@/stores/ownerRestaurantStore'

const slotSchema = z.object({
  date: z.string().min(1, '예약 날짜를 선택해주세요.'),
  startTime: z.string().min(1, '시작 시간을 선택해주세요.'),
  endTime: z.string().min(1, '마지막 시간을 선택해주세요.'),
  interval: z.number().refine((value) => [30, 60].includes(value), '예약 간격을 선택해주세요.'),
  tableCapacity: z.number().min(1, '테이블 정원은 1명 이상이어야 합니다.').max(20, '테이블 정원은 최대 20명입니다.'),
}).refine((value) => value.startTime <= value.endTime, { message: '마지막 시간은 시작 시간 이후여야 합니다.', path: ['endTime'] })
type SlotValues = z.infer<typeof slotSchema>

export function OwnerRestaurantManagePage() {
  const restaurantId = Number(useParams().restaurantId)
  const restaurant = useOwnerRestaurantStore((state) => state.restaurants.find((item) => item.id === restaurantId))
  const addSlots = useOwnerRestaurantStore((state) => state.addSlots)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<SlotValues>({
    resolver: zodResolver(slotSchema),
    defaultValues: { startTime: '18:00', endTime: '20:00', interval: 30, tableCapacity: 4 },
  })

  if (!restaurant) return <div className="mx-auto max-w-4xl py-20 text-center"><h1 className="text-2xl font-semibold">식당을 찾을 수 없습니다</h1><Link to="/owner/restaurants"><Button className="mt-6">식당 목록으로</Button></Link></div>

  const onSubmit = (values: SlotValues) => {
    const toMinutes = (time: string) => {
      const [hour, minute] = time.split(':').map(Number)
      return hour * 60 + minute
    }
    const toTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
    const times: string[] = []
    for (let minutes = toMinutes(values.startTime); minutes <= toMinutes(values.endTime); minutes += values.interval) {
      times.push(toTime(minutes))
    }
    addSlots(restaurant.id, times.map((time) => ({ date: values.date, time, tableCapacity: values.tableCapacity })))
    reset({ date: values.date, startTime: values.startTime, endTime: values.endTime, interval: values.interval, tableCapacity: values.tableCapacity })
  }

  return <div className="mx-auto max-w-6xl">
    <header className="mb-8">
      <p className="text-sm font-semibold text-brand">RESTAURANT MANAGEMENT</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">식당 관리</h1>
      <p className="mt-2 text-sm text-muted">식당 정보를 확인하고 손님이 선택할 예약 가능 시간을 추가하세요.</p>
    </header>

    <section className="card overflow-hidden">
      <div className="border-b border-line bg-brand-soft px-6 py-4 text-sm font-semibold text-brand">식당 정보 미리보기</div>
      <div className="grid gap-6 p-6 md:grid-cols-[120px_1fr] md:p-8">
        <span className="grid size-24 place-items-center rounded-[24px] bg-accent-soft text-accent"><Store size={38} /></span>
        <div>
          <div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-semibold">{restaurant.name}</h2><span className="rounded-full bg-sub-soft px-3 py-1 text-xs font-semibold text-brand">{restaurant.category}</span></div>
          <p className="mt-4 flex items-start gap-2 text-sm text-muted"><MapPin size={16} className="mt-0.5 shrink-0" />{restaurant.address}</p>
          <p className="mt-5 max-w-3xl leading-7 text-muted">{restaurant.description}</p>
          {(restaurant.tags?.length ?? 0) > 0 && <div className="mt-5 flex flex-wrap gap-2">{restaurant.tags.map((tag) => <span key={tag} className="rounded-full bg-sub-soft px-3 py-2 text-xs font-semibold text-brand">{tag}</span>)}</div>}
        </div>
      </div>
    </section>

    <div className="mt-6 grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
      <section className="card p-6">
        <p className="text-sm font-semibold text-brand">예약 시간 일괄 추가</p>
        <h2 className="mt-2 text-xl font-semibold">여러 시간 한 번에 등록</h2>
        <p className="mt-2 text-sm leading-6 text-muted">시작 시간부터 마지막 시간까지 선택한 간격으로 예약 시간을 자동 생성합니다.</p>
        <form className="mt-6 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <label className="block"><span className="label">날짜</span><input type="date" className="field" {...register('date')} /><span className="mt-1 block text-xs text-red-700">{errors.date?.message}</span></label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="label">시작 시간</span><input type="time" className="field" {...register('startTime')} /><span className="mt-1 block text-xs text-red-700">{errors.startTime?.message}</span></label>
            <label className="block"><span className="label">마지막 시간</span><input type="time" className="field" {...register('endTime')} /><span className="mt-1 block text-xs text-red-700">{errors.endTime?.message}</span></label>
          </div>
          <label className="block"><span className="label">예약 간격</span><select className="field" {...register('interval', { valueAsNumber: true })}><option value={30}>30분 간격</option><option value={60}>60분 간격</option></select><span className="mt-1 block text-xs text-red-700">{errors.interval?.message}</span></label>
          <label className="block"><span className="label">테이블 정원</span><input type="number" min="1" max="20" className="field" {...register('tableCapacity', { valueAsNumber: true })} /><span className="mt-1 block text-xs text-red-700">{errors.tableCapacity?.message}</span></label>
          <Button fullWidth type="submit" className="gap-2"><CalendarPlus size={17} />예약 시간 일괄 등록</Button>
        </form>
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-line px-6 py-5"><p className="text-sm font-semibold text-brand">예약 설정</p><h2 className="mt-1 text-xl font-semibold">등록된 예약 시간</h2></div>
        {restaurant.slots.length === 0
          ? <div className="grid min-h-72 place-items-center p-8 text-center"><div><Clock3 className="mx-auto text-muted" /><p className="mt-4 font-semibold">등록된 예약 시간이 없습니다</p><p className="mt-2 text-sm text-muted">왼쪽 입력란에서 첫 예약 시간을 추가해주세요.</p></div></div>
          : <div>{restaurant.slots.map((slot) => <article key={slot.id} className="flex flex-col gap-4 border-b border-line p-5 last:border-0 sm:flex-row sm:items-center">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand"><Clock3 size={20} /></span>
            <div><p className="font-semibold">{formatDateTime(slot.dateTime)}</p><p className="mt-2 flex items-center gap-2 text-sm text-muted"><Users size={15} />잔여 좌석 {slot.remainingSeats}석 ({slot.tableCapacity}인 테이블)</p></div>
            <span className="sm:ml-auto rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-active">예약 가능</span>
          </article>)}</div>}
      </section>
    </div>
  </div>
}
