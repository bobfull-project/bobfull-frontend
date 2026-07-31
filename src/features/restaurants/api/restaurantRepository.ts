import { apiClient } from '@/lib/api/client'
import { apiConfig } from '@/lib/api/config'
import { restaurants } from '@/mocks/data'
import type { Category, Restaurant } from '@/types/domain'

export interface RestaurantSearchParams {
  keyword?: string
  category?: string
  date?: string
  time?: string
  page?: number
  size?: number
  sort?: string
}

export interface RestaurantRepository {
  getAll(params?: RestaurantSearchParams): Promise<Restaurant[]>
  getById(id: number): Promise<Restaurant>
}

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms))

const mockRepository: RestaurantRepository = {
  async getAll() { await wait(); return restaurants },
  async getById(id) {
    await wait()
    const restaurant = restaurants.find((item) => item.id === id)
    if (!restaurant) throw new Error('식당을 찾을 수 없습니다.')
    return restaurant
  },
}

// 백엔드 응답(docs/BOBFULL_API_SPEC_COMPLETE.md 0.3, RestaurantDetailResponse)이 실제로 주는 필드다.
// rating·image·priceRange·tags는 ERD에 없어 백엔드가 주지 않으므로, 화면이 깨지지 않도록 기본값을 채운다.
interface BackendRestaurant {
  restaurantId: number
  name: string
  address: string
  category: string
  description: string
  keyword: string
  depositPerPerson: number
}

// 목록·검색 응답(3-5, RestaurantSearchResponse)은 상세 조회와 달리 description을 주지 않는다.
type BackendRestaurantListItem = Omit<BackendRestaurant, 'description'>

function toRestaurant(backend: BackendRestaurant): Restaurant {
  return {
    id: backend.restaurantId,
    name: backend.name,
    category: backend.category as Category,
    area: backend.address,
    description: backend.description,
    depositPerPerson: backend.depositPerPerson,
    rating: 0,
    priceRange: `1인 ${backend.depositPerPerson.toLocaleString()}원`,
    image: '🍽️',
    tags: backend.keyword ? backend.keyword.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
  }
}

function toRestaurantListItem(backend: BackendRestaurantListItem): Restaurant {
  return toRestaurant({ ...backend, description: '' })
}

const httpRepository: RestaurantRepository = {
  async getAll(params) {
    const response = await apiClient.get<{ data: { content: BackendRestaurantListItem[] } }>(
      '/restaurants', { params },
    )
    return response.data.data.content.map(toRestaurantListItem)
  },
  async getById(id) {
    const response = await apiClient.get<{ data: BackendRestaurant }>(`/restaurants/${id}`)
    return toRestaurant(response.data.data)
  },
}

export const restaurantRepository: RestaurantRepository = apiConfig.useMock ? mockRepository : httpRepository
