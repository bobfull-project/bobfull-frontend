import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Category, DiningTable, ReservationSlot } from '@/types/domain'

export interface OwnerRestaurant {
  id: number
  name: string
  address: string
  category: Category
  description: string
  depositPerPerson: number
  tags: string[]
  status: 'ACTIVE'
  tables: DiningTable[]
  slots: ReservationSlot[]
}

export interface OwnerRestaurantInput {
  name: string
  address: string
  category: Category
  description: string
  depositPerPerson: number
  tags: string[]
}

export interface CreateSlotInput {
  reservationDate: string
  firstReservationStartTime: string
  lastReservationStartTime: string
  slotIntervalMinutes: number
  usageDurationMinutes: number
  tableIds: number[]
}

interface OwnerRestaurantState {
  restaurants: OwnerRestaurant[]
  addRestaurant: (input: OwnerRestaurantInput) => number
  addTables: (restaurantId: number, capacity: number, count: number) => void
  addSlots: (restaurantId: number, input: CreateSlotInput) => void
}

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

const toTime = (minutes: number) => `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`

const initialSlots: ReservationSlot[] = [
  {
    id: 1001, restaurantId: 1, tableId: 11, tableDisplayNumber: 1, reservationDate: '2026-07-25',
    startTime: '18:00', endTime: '19:30', capacity: 6, currentParticipants: 2, status: 'RECRUITING',
    sharedTableId: 11, tableName: '테이블 1', startAt: '2026-07-25T18:00:00+09:00',
    endAt: '2026-07-25T19:30:00+09:00', dateTime: '2026-07-25T18:00:00+09:00',
    tableCapacity: 6, remainingSeats: 4,
  },
  {
    id: 1002, restaurantId: 1, tableId: 12, tableDisplayNumber: 2, reservationDate: '2026-07-25',
    startTime: '18:30', endTime: '20:00', capacity: 4, currentParticipants: 4, status: 'FULL',
    sharedTableId: 12, tableName: '테이블 2', startAt: '2026-07-25T18:30:00+09:00',
    endAt: '2026-07-25T20:00:00+09:00', dateTime: '2026-07-25T18:30:00+09:00',
    tableCapacity: 4, remainingSeats: 0,
  },
]

export const useOwnerRestaurantStore = create<OwnerRestaurantState>()(persist((set) => ({
  restaurants: [
    {
      id: 1,
      name: '담소식탁',
      address: '제주특별자치도 제주시 구좌읍 해맞이해안로 42',
      category: '한식',
      description: '제주 제철 재료로 차린 따뜻한 한 끼를 함께 나누는 식당입니다.',
      depositPerPerson: 5000,
      tags: ['제철 한식', '조용한 분위기'],
      status: 'ACTIVE',
      tables: [
        { id: 11, restaurantId: 1, displayNumber: 1, capacity: 6, active: true },
        { id: 12, restaurantId: 1, displayNumber: 2, capacity: 4, active: true },
      ],
      slots: initialSlots,
    },
    {
      id: 2,
      name: '스시 하루',
      address: '제주특별자치도 서귀포시 성산읍 일출로 18',
      category: '일식',
      description: '제주 바다를 바라보며 편안하게 즐기는 캐주얼 스시 다이닝입니다.',
      depositPerPerson: 10000,
      tags: ['제주 해산물', '바 좌석'],
      status: 'ACTIVE',
      tables: [],
      slots: [],
    },
  ],
  addRestaurant: (input) => {
    const id = Date.now()
    set((state) => ({
      restaurants: [...state.restaurants, { id, ...input, status: 'ACTIVE', tables: [], slots: [] }],
    }))
    return id
  },
  addTables: (restaurantId, capacity, count) => set((state) => ({
    restaurants: state.restaurants.map((restaurant) => {
      if (restaurant.id !== restaurantId) return restaurant
      const maxDisplayNumber = Math.max(0, ...restaurant.tables.map((table) => table.displayNumber))
      const tables = Array.from({ length: count }, (_, index) => ({
        id: Date.now() + index,
        restaurantId,
        displayNumber: maxDisplayNumber + index + 1,
        capacity,
        active: true,
      }))
      return { ...restaurant, tables: [...restaurant.tables, ...tables] }
    }),
  })),
  addSlots: (restaurantId, input) => set((state) => ({
    restaurants: state.restaurants.map((restaurant) => {
      if (restaurant.id !== restaurantId) return restaurant
      const tables = restaurant.tables.filter((table) => input.tableIds.includes(table.id))
      const startTimes: string[] = []
      for (let minute = toMinutes(input.firstReservationStartTime); minute <= toMinutes(input.lastReservationStartTime); minute += input.slotIntervalMinutes) {
        startTimes.push(toTime(minute))
      }
      let sequence = 0
      const slots = tables.flatMap((table) => startTimes.map((startTime): ReservationSlot => {
        const endTime = toTime(toMinutes(startTime) + input.usageDurationMinutes)
        const startAt = `${input.reservationDate}T${startTime}:00+09:00`
        const endAt = `${input.reservationDate}T${endTime}:00+09:00`
        return {
          id: Date.now() + sequence++,
          restaurantId,
          tableId: table.id,
          tableDisplayNumber: table.displayNumber,
          reservationDate: input.reservationDate,
          startTime,
          endTime,
          capacity: table.capacity,
          currentParticipants: 0,
          status: 'RECRUITING',
          sharedTableId: table.id,
          tableName: `테이블 ${table.displayNumber}`,
          startAt,
          endAt,
          dateTime: startAt,
          tableCapacity: table.capacity,
          remainingSeats: table.capacity,
        }
      }))
      return { ...restaurant, slots: [...restaurant.slots, ...slots] }
    }),
  })),
}), { name: 'bobfull-owner-restaurants-v4' }))
