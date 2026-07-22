import { z } from 'zod'

export const reservationSchema = z.object({
  dateTime: z.string().min(1, '날짜와 시간을 선택해주세요.'),
  capacity: z.number().min(2, '최소 2명 이상이어야 합니다.').max(10, '최대 10명까지 가능합니다.'),
  note: z.string().min(5, '모임 소개를 5자 이상 입력해주세요.').max(200),
})

export type ReservationFormValues = z.infer<typeof reservationSchema>
