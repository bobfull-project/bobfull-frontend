import type { ReservationStatus } from '@/types/domain'

export const reservationStatusLabel: Record<ReservationStatus, string> = {
  RECRUITING: '모집 중',
  CONFIRMED: '확정',
  CANCELLED: '취소됨',
  CLOSED: '종료',
}
