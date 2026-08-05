import { apiClient } from '@/lib/api/client'

export interface OwnerRestaurantSummary {
  restaurantId: number
  name: string
  address: string
  category: string
  depositPerPerson: number
  status: string
  imageUrl?: string
}

export interface OwnerRestaurantDetail extends OwnerRestaurantSummary {
  description: string
  keyword: string
}

export interface RestaurantInput {
  name: string
  address: string
  category: string
  description: string
  keyword: string
  depositPerPerson: number
  imageKey?: string
}

export interface RestaurantImageUploadUrlInput {
  extension: string
  contentType: string
  fileSize: number
}

export interface RestaurantImageUploadUrlResponse {
  uploadUrl: string
  tempImageKey: string
  finalImageKey: string
}

interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export async function getMyRestaurants(): Promise<OwnerRestaurantSummary[]> {
  const response = await apiClient.get<{ data: PageResponse<OwnerRestaurantSummary> }>(
    '/owner/restaurants', { params: { size: 100 } },
  )
  return response.data.data.content
}

export async function getMyRestaurant(restaurantId: number): Promise<OwnerRestaurantDetail> {
  const response = await apiClient.get<{ data: OwnerRestaurantDetail }>(`/owner/restaurants/${restaurantId}`)
  return response.data.data
}

export async function registerRestaurant(input: RestaurantInput): Promise<number> {
  const response = await apiClient.post<{ data: { restaurantId: number } }>('/owner/restaurants', input)
  return response.data.data.restaurantId
}

export async function uploadRestaurantImageFile(
  file: File,
  input: RestaurantImageUploadUrlInput,
): Promise<RestaurantImageUploadUrlResponse> {
  const uploadUrlResponse = await apiClient.post<{ data: RestaurantImageUploadUrlResponse }>(
    '/owner/restaurants/images/upload-url',
    input,
  )
  const uploadInfo = uploadUrlResponse.data.data
  const uploadResponse = await fetch(uploadInfo.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })

  if (!uploadResponse.ok) {
    throw new Error('이미지 업로드에 실패했습니다.')
  }

  return uploadInfo
}

export async function updateRestaurant(
  restaurantId: number,
  input: Pick<RestaurantInput, 'name' | 'description' | 'keyword' | 'depositPerPerson'>,
): Promise<void> {
  await apiClient.patch(`/owner/restaurants/${restaurantId}`, input)
}

export async function deleteRestaurant(restaurantId: number): Promise<void> {
  await apiClient.delete(`/owner/restaurants/${restaurantId}`)
}
