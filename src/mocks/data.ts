import type { Reservation, ReservationSlot, Restaurant } from '@/types/domain'

export const restaurants: Restaurant[] = [
  { id: 1, name: '담소식탁', category: '한식', area: '성수동', description: '제철 재료로 차린 따뜻한 한 끼와 편안한 대화가 있는 식탁입니다.', rating: 4.8, priceRange: '₩₩', image: '🥘', tags: ['제철 한식', '조용한 분위기'] },
  { id: 2, name: '스시 하루', category: '일식', area: '연남동', description: '부담 없는 구성으로 함께 즐기는 캐주얼 스시 다이닝입니다.', rating: 4.7, priceRange: '₩₩₩', image: '🍣', tags: ['오마카세', '바 좌석'] },
  { id: 3, name: '모락모락', category: '중식', area: '을지로', description: '여럿이 나눌수록 맛있는 딤섬과 요리를 준비합니다.', rating: 4.6, priceRange: '₩₩', image: '🥟', tags: ['딤섬', '단체석'] },
  { id: 4, name: '오후의 파스타', category: '양식', area: '망원동', description: '생면 파스타와 내추럴 와인을 편안하게 즐기는 작은 공간입니다.', rating: 4.9, priceRange: '₩₩₩', image: '🍝', tags: ['생면 파스타', '데이트'] },
  { id: 5, name: '테이블 브루', category: '카페', area: '한남동', description: '커피와 가벼운 브런치를 긴 테이블에서 나눌 수 있습니다.', rating: 4.5, priceRange: '₩₩', image: '🥐', tags: ['브런치', '큰 테이블'] },
  { id: 6, name: '오늘의 국밥', category: '한식', area: '종로', description: '든든한 국밥 한 그릇으로 시작하는 소박한 밥 모임입니다.', rating: 4.7, priceRange: '₩', image: '🍲', tags: ['혼밥 환영', '빠른 식사'] },
]

export const reservations: Reservation[] = [
  { id: 101, restaurantId: 1, restaurantName: '담소식탁', hostName: '민지', dateTime: '2026-07-23T19:00:00+09:00', capacity: 4, joined: 3, status: 'OPEN', note: '퇴근 후 편하게 저녁 먹어요.' },
  { id: 102, restaurantId: 4, restaurantName: '오후의 파스타', hostName: '준호', dateTime: '2026-07-25T18:30:00+09:00', capacity: 3, joined: 2, status: 'OPEN', note: '파스타 좋아하시는 분 환영해요.' },
  { id: 103, restaurantId: 3, restaurantName: '모락모락', hostName: '서연', dateTime: '2026-07-28T12:30:00+09:00', capacity: 5, joined: 5, status: 'CONFIRMED', note: '주말 딤섬 모임입니다.' },
]

export const reservationSlots: ReservationSlot[] = [
  { id: 1001, restaurantId: 1, dateTime: '2026-07-24T18:00:00+09:00', tableCapacity: 6, remainingSeats: 4, status: 'AVAILABLE' },
  { id: 1002, restaurantId: 1, dateTime: '2026-07-24T18:30:00+09:00', tableCapacity: 4, remainingSeats: 2, status: 'AVAILABLE' },
  { id: 1003, restaurantId: 1, dateTime: '2026-07-24T19:00:00+09:00', tableCapacity: 4, remainingSeats: 0, status: 'SOLD_OUT' },
  { id: 2001, restaurantId: 2, dateTime: '2026-07-24T17:30:00+09:00', tableCapacity: 4, remainingSeats: 3, status: 'AVAILABLE' },
  { id: 2002, restaurantId: 2, dateTime: '2026-07-24T18:30:00+09:00', tableCapacity: 6, remainingSeats: 5, status: 'AVAILABLE' },
  { id: 3001, restaurantId: 3, dateTime: '2026-07-24T18:00:00+09:00', tableCapacity: 6, remainingSeats: 1, status: 'AVAILABLE' },
  { id: 4001, restaurantId: 4, dateTime: '2026-07-24T18:30:00+09:00', tableCapacity: 4, remainingSeats: 2, status: 'AVAILABLE' },
  { id: 5001, restaurantId: 5, dateTime: '2026-07-24T11:30:00+09:00', tableCapacity: 6, remainingSeats: 4, status: 'AVAILABLE' },
  { id: 6001, restaurantId: 6, dateTime: '2026-07-24T19:00:00+09:00', tableCapacity: 4, remainingSeats: 3, status: 'AVAILABLE' },
]
