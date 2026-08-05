import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ImagePlus, X } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  registerRestaurant,
  uploadRestaurantImageFile,
  type RestaurantInput,
  type RestaurantImageUploadUrlInput,
} from '@/features/owner/api/restaurantApi'

const schema = z.object({
  name: z.string().min(1, '식당명을 입력해주세요.'),
  address: z.string().min(5, '주소를 입력해주세요.'),
  category: z.enum(['한식', '일식', '중식', '양식', '카페']),
  description: z.string().min(10, '소개를 10자 이상 입력해주세요.').max(300, '소개는 300자 이하로 입력해주세요.'),
  depositPerPerson: z.number().min(0, '예약금은 0원 이상이어야 합니다.').max(100000, '1인당 예약금은 최대 100,000원입니다.'),
  tags: z.array(z.string().max(15, '키워드는 15자 이하로 입력해주세요.')).max(3),
}).superRefine((value, context) => {
  if (!value.tags.some((tag) => tag.trim())) {
    context.addIssue({ code: 'custom', path: ['tags', 0], message: '키워드를 최소 1개 입력해주세요.' })
  }
})
type Values = z.infer<typeof schema>

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png']
const ALLOWED_IMAGE_CONTENT_TYPES = ['image/jpeg', 'image/png']
const FINAL_IMAGE_NOT_FOUND_CODE = 'RESTAURANT_IMAGE_NOT_FOUND'
const IMAGE_READY_RETRY_INTERVAL_MS = 1000
const IMAGE_READY_MAX_RETRIES = 5

function getImageExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

function getImageValidationError(file: File) {
  const extension = getImageExtension(file.name)
  if (!ALLOWED_IMAGE_EXTENSIONS.includes(extension) || !ALLOWED_IMAGE_CONTENT_TYPES.includes(file.type)) {
    return 'JPG, JPEG, PNG 이미지 파일만 업로드할 수 있습니다.'
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return '이미지는 최대 5MB까지 업로드할 수 있습니다.'
  }
  return null
}

function toImageUploadInput(file: File): RestaurantImageUploadUrlInput {
  return {
    extension: getImageExtension(file.name),
    contentType: file.type,
    fileSize: file.size,
  }
}

function toApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response
    if (response?.data?.message) return response.data.message
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

function getApiErrorCode(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    return (error as { response?: { data?: { code?: string } } }).response?.data?.code
  }
  return undefined
}

function wait(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

async function registerRestaurantWithImageRetry(input: RestaurantInput) {
  for (let retryCount = 0; ; retryCount += 1) {
    try {
      return await registerRestaurant(input)
    } catch (error) {
      const shouldRetry = input.imageKey
        && getApiErrorCode(error) === FINAL_IMAGE_NOT_FOUND_CODE
        && retryCount < IMAGE_READY_MAX_RETRIES
      if (!shouldRetry) throw error
      await wait(IMAGE_READY_RETRY_INTERVAL_MS)
    }
  }
}

export function OwnerRestaurantFormPage() {
  const navigate = useNavigate()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const [finalImageKey, setFinalImageKey] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { category: '한식', depositPerPerson: 5000, tags: ['', '', ''] },
  })

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      let imageKey = finalImageKey
      if (selectedImage && !imageKey) {
        setIsUploadingImage(true)
        try {
          const uploadInfo = await uploadRestaurantImageFile(selectedImage, toImageUploadInput(selectedImage))
          imageKey = uploadInfo.finalImageKey
          setFinalImageKey(uploadInfo.finalImageKey)
        } finally {
          setIsUploadingImage(false)
        }
      }

      return registerRestaurantWithImageRetry({
        name: values.name,
        address: values.address,
        category: values.category,
        description: values.description,
        depositPerPerson: values.depositPerPerson,
        keyword: values.tags.map((tag) => tag.trim()).filter(Boolean).join(','),
        ...(imageKey ? { imageKey } : {}),
      })
    },
    onSuccess: (restaurantId) => navigate(`/owner/restaurants/${restaurantId}`),
  })

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setImageError(null)
    setFinalImageKey(null)

    if (!file) {
      setSelectedImage(null)
      setPreviewUrl(null)
      return
    }

    const validationError = getImageValidationError(file)
    if (validationError) {
      setSelectedImage(null)
      setPreviewUrl(null)
      setImageError(validationError)
      event.target.value = ''
      return
    }

    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const clearSelectedImage = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
    setImageError(null)
    setFinalImageKey(null)
    if (imageInputRef.current) imageInputRef.current.value = ''
  }

  const submitError = mutation.isError
    ? toApiErrorMessage(mutation.error, '식당 등록에 실패했습니다.')
    : null
  const isSubmitting = mutation.isPending || isUploadingImage

  return <div className="mx-auto max-w-3xl">
    <PageHeader eyebrow="NEW RESTAURANT" title="식당 등록" description="식당 정보를 먼저 등록한 후 식당 관리 페이지에서 예약 가능 시간을 추가할 수 있습니다." />
    <form className="card space-y-6 p-6 md:p-8" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
      <label className="block"><span className="label">식당명</span><input className="field" placeholder="식당명을 입력해주세요." {...register('name')} /><span className="mt-1 block text-xs text-red-700">{errors.name?.message}</span></label>
      <label className="block"><span className="label">주소</span><input className="field" placeholder="제주특별자치도 제주시..." {...register('address')} /><span className="mt-1 block text-xs text-red-700">{errors.address?.message}</span></label>
      <label className="block"><span className="label">음식 카테고리</span><select className="field" {...register('category')}>{['한식', '일식', '중식', '양식', '카페'].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="block"><span className="label">식당 소개</span><textarea rows={6} className="field h-auto py-4" placeholder="식당의 분위기와 대표 메뉴를 소개해주세요." {...register('description')} /><span className="mt-1 block text-xs text-red-700">{errors.description?.message}</span></label>
      <div>
        <span className="label">식당 이미지</span>
        <div className="grid gap-4 rounded-2xl border border-dashed border-line p-4 sm:grid-cols-[160px_1fr] sm:items-center">
          <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl bg-brand-soft text-brand">
            {previewUrl ? <img src={previewUrl} alt="선택한 식당 이미지 미리보기" className="h-full w-full object-cover" /> : <ImagePlus size={32} />}
          </div>
          <div>
            <input ref={imageInputRef} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="field h-auto py-3" onChange={handleImageChange} disabled={isSubmitting} />
            <p className="mt-2 text-xs text-muted">JPG, JPEG, PNG 파일만 가능하며 최대 5MB까지 업로드할 수 있습니다.</p>
            {selectedImage && <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted">
              <span>{selectedImage.name} · {(selectedImage.size / 1024).toFixed(1)}KB</span>
              <button type="button" className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:text-brand" onClick={clearSelectedImage} disabled={isSubmitting}><X size={15} />선택 해제</button>
            </div>}
            {imageError && <p className="mt-2 text-sm text-red-700">{imageError}</p>}
          </div>
        </div>
      </div>
      <label className="block"><span className="label">1인당 예약금</span><input type="number" min="0" step="1000" className="field" {...register('depositPerPerson', { valueAsNumber: true })} /><span className="mt-1 block text-xs text-muted">예약 생성·참여 시 인원수에 따라 결제할 금액입니다.</span><span className="mt-1 block text-xs text-red-700">{errors.depositPerPerson?.message}</span></label>
      <fieldset>
        <legend className="label">식당 키워드 <span className="font-normal text-muted">(최소 1개, 최대 3개)</span></legend>
        <p className="mb-3 text-xs text-muted">손님이 식당의 음식과 분위기를 빠르게 이해할 수 있는 표현을 입력해주세요.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((index) => <label key={index} className="block"><span className="sr-only">키워드 {index + 1}</span><input className="field" maxLength={15} placeholder={index === 0 ? '예: 제철 한식' : index === 1 ? '예: 조용한 분위기' : '예: 혼밥 환영'} {...register(`tags.${index}`)} /><span className="mt-1 block text-xs text-red-700">{errors.tags?.[index]?.message}</span></label>)}
        </div>
      </fieldset>
      {submitError && <p className="text-sm text-red-700">{submitError}</p>}
      <div className="flex justify-end gap-3"><Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={isSubmitting}>취소</Button><Button type="submit" disabled={isSubmitting}>{isUploadingImage ? '이미지 업로드 중...' : mutation.isPending ? '등록 중...' : '식당 등록하기'}</Button></div>
    </form>
  </div>
}
