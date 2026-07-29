import { apiClient } from '@/lib/api/client'
import { restaurants } from '@/mocks/data'
import type { Category, Restaurant } from '@/types/domain'

export interface RestaurantRepository {
  getAll(): Promise<Restaurant[]>
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

const httpRepository: RestaurantRepository = {
  // 주의: 백엔드에 목록 조회(GET /restaurants) API가 아직 없어 이 호출은 현재 실패한다.
  async getAll() {
    const response = await apiClient.get<{ data: BackendRestaurant[] }>('/restaurants')
    return response.data.data.map(toRestaurant)
  },
  async getById(id) {
    const response = await apiClient.get<{ data: BackendRestaurant }>(`/restaurants/${id}`)
    return toRestaurant(response.data.data)
  },
}

// 목록 조회는 백엔드 API가 아직 없어 mock을 쓰고, 상세 조회만 실제 백엔드로 검증된 httpRepository를 쓴다.
// VITE_USE_MOCK을 전역으로 끄면 예약(reservationRepository) 등 아직 안 붙은 기능까지 깨지므로,
// 이 도메인만 플래그와 무관하게 별도로 분기한다.
export const restaurantRepository: RestaurantRepository = {
  getAll: mockRepository.getAll,
  getById: httpRepository.getById,
}
