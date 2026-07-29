import { z } from 'zod'

export const reservationSchema = z.object({
  partySize: z.number().min(1, '최소 1명 이상이어야 합니다.'),
})

export type ReservationFormValues = z.infer<typeof reservationSchema>
