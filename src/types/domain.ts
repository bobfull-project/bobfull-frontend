export type Category = '한식' | '일식' | '중식' | '양식' | '카페'
export type ReservationStatus = 'OPEN' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'

export interface Restaurant {
  id: number
  name: string
  category: Category
  area: string
  description: string
  rating: number
  priceRange: string
  image: string
  tags: string[]
}

export interface Reservation {
  id: number
  restaurantId: number
  restaurantName: string
  hostName: string
  dateTime: string
  capacity: number
  joined: number
  status: ReservationStatus
  note: string
}

export interface ReservationSlot {
  id: number
  restaurantId: number
  dateTime: string
  tableCapacity: number
  remainingSeats: number
  status: 'AVAILABLE' | 'SOLD_OUT'
}
