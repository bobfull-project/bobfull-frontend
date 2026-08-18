import type { ReservationStatus } from '@/types/domain'

export const reservationStatusLabel: Record<ReservationStatus, string> = {
  RECRUITING: '모집 중',
  CONFIRMED: '확정',
  CANCELLED: '취소됨',
  CLOSED: '종료',
}

export const reservationStatusClass: Record<ReservationStatus, string> = {
  RECRUITING: 'bg-accent-soft text-accent-active',
  CONFIRMED: 'bg-brand-soft text-brand-active',
  CANCELLED: 'bg-red-50 text-red-600',
  CLOSED: 'bg-stone-100 text-stone-500',
}
