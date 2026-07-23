import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category, ReservationSlot } from '@/types/domain'

export interface OwnerRestaurant {
  id: number
  name: string
  address: string
  category: Category
  description: string
  tags: string[]
  slots: ReservationSlot[]
}

export interface OwnerRestaurantInput {
  name: string
  address: string
  category: Category
  description: string
  tags: string[]
}

interface SlotInput {
  date: string
  time: string
  tableCapacity: number
}

interface OwnerRestaurantState {
  restaurants: OwnerRestaurant[]
  addRestaurant: (input: OwnerRestaurantInput) => number
  addSlots: (restaurantId: number, inputs: SlotInput[]) => void
}

export const useOwnerRestaurantStore = create<OwnerRestaurantState>()(persist((set) => ({
  restaurants: [
    {
      id: 1,
      name: '담소식탁',
      address: '제주특별자치도 제주시 구좌읍 해맞이해안로 42',
      category: '한식',
      description: '제주 제철 재료로 차린 따뜻한 한 끼를 함께 나누는 식당입니다.',
      tags: ['제철 한식', '조용한 분위기'],
      slots: [
        { id: 1001, restaurantId: 1, dateTime: '2026-07-24T18:00:00+09:00', tableCapacity: 6, remainingSeats: 4, status: 'AVAILABLE' },
        { id: 1002, restaurantId: 1, dateTime: '2026-07-24T18:30:00+09:00', tableCapacity: 4, remainingSeats: 2, status: 'AVAILABLE' },
      ],
    },
    {
      id: 2,
      name: '스시 하루',
      address: '제주특별자치도 서귀포시 성산읍 일출로 18',
      category: '일식',
      description: '제주 바다를 바라보며 편안하게 즐기는 캐주얼 스시 다이닝입니다.',
      tags: ['제주 해산물', '바 좌석'],
      slots: [],
    },
  ],
  addRestaurant: (input) => {
    const id = Date.now()
    set((state) => ({ restaurants: [...state.restaurants, { id, ...input, slots: [] }] }))
    return id
  },
  addSlots: (restaurantId, inputs) => set((state) => ({
    restaurants: state.restaurants.map((restaurant) => {
      if (restaurant.id !== restaurantId) return restaurant
      const existingDateTimes = new Set(restaurant.slots.map((slot) => slot.dateTime))
      const slots: ReservationSlot[] = inputs
        .map((input, index) => ({
          id: Date.now() + index,
          restaurantId,
          dateTime: `${input.date}T${input.time}:00+09:00`,
          tableCapacity: input.tableCapacity,
          remainingSeats: input.tableCapacity,
          status: 'AVAILABLE' as const,
        }))
        .filter((slot) => !existingDateTimes.has(slot.dateTime))
      return { ...restaurant, slots: [...restaurant.slots, ...slots] }
    }),
  })),
}), { name: 'bobfull-owner-restaurants' }))
