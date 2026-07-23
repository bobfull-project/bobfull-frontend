import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { useOwnerRestaurantStore } from '@/stores/ownerRestaurantStore'

const schema = z.object({
  name: z.string().min(1, '식당명을 입력해주세요.'),
  address: z.string().min(5, '주소를 입력해주세요.'),
  category: z.enum(['한식', '일식', '중식', '양식', '카페']),
  description: z.string().min(10, '소개를 10자 이상 입력해주세요.').max(300, '소개는 300자 이하로 입력해주세요.'),
  tags: z.array(z.string().max(15, '키워드는 15자 이하로 입력해주세요.')).max(3),
})
type Values = z.infer<typeof schema>

export function OwnerRestaurantFormPage() {
  const navigate = useNavigate()
  const addRestaurant = useOwnerRestaurantStore((state) => state.addRestaurant)
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { category: '한식', tags: ['', '', ''] },
  })
  const onSubmit = (values: Values) => {
    const id = addRestaurant({ ...values, tags: values.tags.map((tag) => tag.trim()).filter(Boolean) })
    navigate(`/owner/restaurants/${id}`)
  }

  return <div className="mx-auto max-w-3xl">
    <PageHeader eyebrow="NEW RESTAURANT" title="식당 등록" description="식당 정보를 먼저 등록한 후 식당 관리 페이지에서 예약 가능 시간을 추가할 수 있습니다." />
    <form className="card space-y-6 p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
      <label className="block"><span className="label">식당명</span><input className="field" placeholder="식당명을 입력해주세요." {...register('name')} /><span className="mt-1 block text-xs text-red-700">{errors.name?.message}</span></label>
      <label className="block"><span className="label">주소</span><input className="field" placeholder="제주특별자치도 제주시..." {...register('address')} /><span className="mt-1 block text-xs text-red-700">{errors.address?.message}</span></label>
      <label className="block"><span className="label">음식 카테고리</span><select className="field" {...register('category')}>{['한식', '일식', '중식', '양식', '카페'].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="block"><span className="label">식당 소개</span><textarea rows={6} className="field h-auto py-4" placeholder="식당의 분위기와 대표 메뉴를 소개해주세요." {...register('description')} /><span className="mt-1 block text-xs text-red-700">{errors.description?.message}</span></label>
      <fieldset>
        <legend className="label">식당 키워드 <span className="font-normal text-muted">(최대 3개)</span></legend>
        <p className="mb-3 text-xs text-muted">손님이 식당의 음식과 분위기를 빠르게 이해할 수 있는 표현을 입력해주세요.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((index) => <label key={index} className="block"><span className="sr-only">키워드 {index + 1}</span><input className="field" maxLength={15} placeholder={index === 0 ? '예: 제철 한식' : index === 1 ? '예: 조용한 분위기' : '예: 혼밥 환영'} {...register(`tags.${index}`)} /><span className="mt-1 block text-xs text-red-700">{errors.tags?.[index]?.message}</span></label>)}
        </div>
      </fieldset>
      <div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={() => navigate(-1)}>취소</Button><Button type="submit">식당 등록하기</Button></div>
    </form>
  </div>
}
