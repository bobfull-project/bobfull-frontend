export type Category = '한식' | '일식' | '중식' | '양식' | '카페'
export type ReservationStatus = 'RECRUITING' | 'CONFIRMED' | 'CANCELLED' | 'CLOSED'
export type RecruitmentStatus = 'OPEN' | 'CLOSED'
export type ParticipationStatus = 'RESERVED' | 'NO_SHOW' | 'CANCELLED'

export interface Restaurant {
  id: number
  name: string
  category: Category
  area: string
  description: string
  rating: number
  priceRange: string
  image: string
  imageUrl?: string
  tags: string[]
  depositPerPerson: number
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
  recruitmentStatus: RecruitmentStatus
}

export interface ReservationSlot {
  id: number
  restaurantId: number
  tableId: number
  tableDisplayNumber: number
  reservationDate: string
  startTime: string
  endTime: string
  capacity: number
  currentParticipants: number
  status: 'RECRUITING' | 'CONFIRMED' | 'FULL' | 'CLOSED'
  sharedTableId: number
  tableName: string
  startAt: string
  endAt: string
  dateTime: string
  tableCapacity: number
  remainingSeats: number
}

export interface DiningTable {
  id: number
  restaurantId: number
  displayNumber: number
  capacity: number
  active: boolean
}

export type SharedTable = DiningTable

export interface ReservationParticipant {
  id: number
  reservationId: number
  memberId: number
  partySize: number
  status: ParticipationStatus
  cancelledAt?: string
  cancelReason?: string
}
