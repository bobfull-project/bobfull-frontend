import { useQuery } from '@tanstack/react-query'
import { restaurantRepository } from './restaurantRepository'

export const restaurantKeys = { all: ['restaurants'] as const, detail: (id: number) => ['restaurants', id] as const }
export const useRestaurants = () => useQuery({ queryKey: restaurantKeys.all, queryFn: restaurantRepository.getAll })
export const useRestaurant = (id: number) => useQuery({ queryKey: restaurantKeys.detail(id), queryFn: () => restaurantRepository.getById(id), enabled: Number.isFinite(id) })
