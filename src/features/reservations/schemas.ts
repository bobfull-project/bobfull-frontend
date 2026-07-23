import { z } from 'zod'

export const reservationSchema = z.object({
  partySize: z.number().min(1, '최소 1명 이상이어야 합니다.'),
  note: z.string().max(200, '요청 사항은 200자 이하로 입력해주세요.'),
})

export type ReservationFormValues = z.infer<typeof reservationSchema>
