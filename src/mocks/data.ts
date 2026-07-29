import type { Reservation, ReservationSlot, Restaurant } from '@/types/domain'

export const restaurants: Restaurant[] = [
  { id: 1, name: '담소식탁', category: '한식', area: '제주시 구좌읍', description: '제철 재료로 차린 따뜻한 한 끼와 편안한 대화가 있는 식탁입니다.', rating: 4.8, priceRange: '₩₩', image: '🥘', tags: ['제철 한식', '조용한 분위기'], depositPerPerson: 5000 },
  { id: 2, name: '스시 하루', category: '일식', area: '서귀포시 성산읍', description: '부담 없는 구성으로 함께 즐기는 캐주얼 스시 다이닝입니다.', rating: 4.7, priceRange: '₩₩₩', image: '🍣', tags: ['오마카세', '바 좌석'], depositPerPerson: 10000 },
  { id: 3, name: '모락모락', category: '중식', area: '제주시 애월읍', description: '여럿이 나눌수록 맛있는 딤섬과 요리를 준비합니다.', rating: 4.6, priceRange: '₩₩', image: '🥟', tags: ['딤섬', '단체석'], depositPerPerson: 5000 },
  { id: 4, name: '오후의 파스타', category: '양식', area: '서귀포시 안덕면', description: '생면 파스타와 내추럴 와인을 편안하게 즐기는 작은 공간입니다.', rating: 4.9, priceRange: '₩₩₩', image: '🍝', tags: ['생면 파스타', '노을 맛집'], depositPerPerson: 10000 },
  { id: 5, name: '테이블 브루', category: '카페', area: '제주시 조천읍', description: '커피와 가벼운 브런치를 긴 테이블에서 나눌 수 있습니다.', rating: 4.5, priceRange: '₩₩', image: '🥐', tags: ['브런치', '큰 테이블'], depositPerPerson: 3000 },
  { id: 6, name: '오늘의 국밥', category: '한식', area: '제주시 일도동', description: '든든한 국밥 한 그릇으로 시작하는 소박한 밥 모임입니다.', rating: 4.7, priceRange: '₩', image: '🍲', tags: ['혼밥 환영', '빠른 식사'], depositPerPerson: 3000 },
]

export const reservations: Reservation[] = [
  { id: 101, restaurantId: 1, restaurantName: '담소식탁', hostName: '민지', dateTime: '2026-07-25T19:00:00+09:00', capacity: 4, joined: 3, status: 'RECRUITING', recruitmentStatus: 'OPEN' },
  { id: 102, restaurantId: 4, restaurantName: '오후의 파스타', hostName: '준호', dateTime: '2026-07-26T18:30:00+09:00', capacity: 4, joined: 2, status: 'RECRUITING', recruitmentStatus: 'OPEN' },
  { id: 103, restaurantId: 3, restaurantName: '모락모락', hostName: '서연', dateTime: '2026-07-28T12:30:00+09:00', capacity: 6, joined: 6, status: 'CONFIRMED', recruitmentStatus: 'CLOSED' },
]

const slot = (
  id: number,
  restaurantId: number,
  sharedTableId: number,
  tableName: string,
  startAt: string,
  endAt: string,
  tableCapacity: number,
  remainingSeats: number,
): ReservationSlot => ({
  id,
  restaurantId,
  tableId: sharedTableId,
  tableDisplayNumber: Number(tableName.match(/\d+/)?.[0] ?? sharedTableId),
  reservationDate: startAt.slice(0, 10),
  startTime: startAt.slice(11, 16),
  endTime: endAt.slice(11, 16),
  capacity: tableCapacity,
  currentParticipants: tableCapacity - remainingSeats,
  status: remainingSeats === 0 ? 'FULL' : 'RECRUITING',
  sharedTableId,
  tableName,
  startAt,
  endAt,
  dateTime: startAt,
  tableCapacity,
  remainingSeats,
})

export const reservationSlots: ReservationSlot[] = [
  slot(1001, 1, 11, '테이블 1', '2026-07-25T18:00:00+09:00', '2026-07-25T19:30:00+09:00', 6, 4),
  slot(1002, 1, 12, '테이블 2', '2026-07-25T18:30:00+09:00', '2026-07-25T20:00:00+09:00', 4, 2),
  slot(1003, 1, 12, '테이블 2', '2026-07-25T20:00:00+09:00', '2026-07-25T21:30:00+09:00', 4, 0),
  slot(2001, 2, 21, '테이블 1', '2026-07-25T17:30:00+09:00', '2026-07-25T19:00:00+09:00', 4, 3),
  slot(2002, 2, 22, '테이블 2', '2026-07-25T18:30:00+09:00', '2026-07-25T20:00:00+09:00', 6, 5),
  slot(3001, 3, 31, '테이블 1', '2026-07-26T18:00:00+09:00', '2026-07-26T19:30:00+09:00', 6, 1),
  slot(4001, 4, 41, '테이블 1', '2026-07-26T18:30:00+09:00', '2026-07-26T20:00:00+09:00', 4, 2),
  slot(5001, 5, 51, '테이블 1', '2026-07-27T11:30:00+09:00', '2026-07-27T13:00:00+09:00', 6, 4),
  slot(6001, 6, 61, '테이블 1', '2026-07-27T19:00:00+09:00', '2026-07-27T20:30:00+09:00', 4, 3),
]
