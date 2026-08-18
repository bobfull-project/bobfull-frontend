import { apiClient } from '@/lib/api/client'

export type ModerationReviewStatus = 'NORMAL' | 'REVIEW_REQUIRED'
export type ModerationCategory = 'PROFANITY' | 'PERSONAL_INFORMATION' | 'SPAM'
export type ModerationRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface ModerationMemberSummary {
  memberId: number
  profanityCount: number
  personalInformationCount: number
  spamCount: number
  totalFlaggedCount: number
  reviewTargetCount: number
  reviewStatus: ModerationReviewStatus
  lastFlaggedAt: string
}

export interface ModerationEvidence {
  messageId: number
  content: string
  categories: ModerationCategory[]
  riskLevel: ModerationRiskLevel
  countedForReview: boolean
  sentAt: string
  analyzedAt: string
}

export interface ModerationMemberDetail {
  memberId: number
  reviewStatus: ModerationReviewStatus
  totalFlaggedCount: number
  reviewTargetCount: number
  riskCounts: Partial<Record<ModerationRiskLevel, number>>
  evidences: ModerationEvidence[]
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export const moderationApi = {
  async getMembers(status?: ModerationReviewStatus) {
    const response = await apiClient.get<ApiResponse<PageResponse<ModerationMemberSummary>>>(
      '/admin/moderation/members',
      { params: { status, size: 100 } },
    )
    return response.data.data
  },

  async getMember(memberId: number) {
    const response = await apiClient.get<ApiResponse<ModerationMemberDetail>>(
      `/admin/moderation/members/${memberId}`,
    )
    return response.data.data
  },
}
