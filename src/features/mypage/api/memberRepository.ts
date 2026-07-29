import { apiClient } from '@/lib/api/client'

export interface MemberProfile {
  memberId: number
  email: string
  name: string
  phoneNumber: string
  role: 'MEMBER' | 'OWNER' | 'ADMIN'
  businessNumber?: string
}

export interface UpdateMemberProfileInput {
  name: string
  phoneNumber: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const memberRepository = {
  async getMe() {
    const response = await apiClient.get<ApiResponse<MemberProfile>>('/members/me')
    return response.data.data
  },
  async updateMe(input: UpdateMemberProfileInput) {
    await apiClient.patch<ApiResponse<{ result: boolean }>>('/members/me', input)
  },
}
