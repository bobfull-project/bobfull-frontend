import { useQuery } from '@tanstack/react-query'
import { restaurantRepository, type RestaurantSearchParams } from './restaurantRepository'

export const restaurantKeys = {
  all: ['restaurants'] as const,
  list: (params?: RestaurantSearchParams) => ['restaurants', 'list', params ?? {}] as const,
  detail: (id: number) => ['restaurants', id] as const,
}
export const useRestaurants = (params?: RestaurantSearchParams) =>
  useQuery({ queryKey: restaurantKeys.list(params), queryFn: () => restaurantRepository.getAll(params) })
export const useRestaurant = (id: number) => useQuery({ queryKey: restaurantKeys.detail(id), queryFn: () => restaurantRepository.getById(id), enabled: Number.isFinite(id) })
