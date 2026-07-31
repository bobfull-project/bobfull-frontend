import { useQuery } from '@tanstack/react-query'
import { reservationRepository, type ReservationSearchParams } from './reservationRepository'

export const reservationKeys = {
  recruiting: (params?: ReservationSearchParams) => ['reservations', 'recruiting', params ?? {}] as const,
}

export const useRecruitingReservations = (params?: ReservationSearchParams) =>
  useQuery({
    queryKey: reservationKeys.recruiting(params),
    queryFn: () => reservationRepository.searchRecruiting(params),
  })
