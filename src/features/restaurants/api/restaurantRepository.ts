import { apiClient } from '@/lib/api/client'
import { apiConfig } from '@/lib/api/config'
import { restaurants } from '@/mocks/data'
import type { Restaurant } from '@/types/domain'

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

const httpRepository: RestaurantRepository = {
  async getAll() { return (await apiClient.get<Restaurant[]>('/restaurants')).data },
  async getById(id) { return (await apiClient.get<Restaurant>(`/restaurants/${id}`)).data },
}

export const restaurantRepository = apiConfig.useMock ? mockRepository : httpRepository
