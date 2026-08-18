import { apiClient } from '@/lib/api/client'
import type { ModerationCategory, ModerationRiskLevel } from '@/features/admin/api/moderationApi'
import type { ChatReportReason } from '@/features/chat/api/chatApi'

export type ReportStatus = 'PENDING' | 'REVIEWED'
export type ReviewDecision = 'NO_VIOLATION' | 'VIOLATION_CONFIRMED'

export interface ModerationReportSummary {
  reportId: number
  chatRoomId: number
  reporterMemberId: number
  reportedMemberId: number
  reason: ChatReportReason
  status: ReportStatus
  anchorMessageId: number | null
  createdAt: string
  decision: ReviewDecision | null
  reviewedByMemberId: number | null
  reviewedAt: string | null
}

interface ContextModeration {
  status: 'SAFE' | 'FLAGGED' | 'ANALYSIS_FAILED'
  categories: ModerationCategory[]
  riskLevel: ModerationRiskLevel | null
  promptVersion: string
  policyVersion: string
  analyzedAt: string | null
}

export interface ModerationReportDetail {
  reportId: number
  chatRoomId: number
  reason: ChatReportReason
  detail: string | null
  reporterMemberId: number
  reportedMemberId: number
  anchorMessageId: number | null
  createdAt: string
  status: ReportStatus
  context: Array<{ messageId: number; senderMemberId: number; content: string; sentAt: string; moderation: ContextModeration | null }>
  moderationSignals: { totalFlaggedCount: number; reviewTargetCount: number; profanityCount: number; personalInformationCount: number; spamCount: number }
  reportSignals: { pendingReportCount: number; reviewedReportCount: number; confirmedViolationCount: number }
}

interface ApiResponse<T> { success: boolean; message: string; data: T }
interface PageResponse<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number }

export const moderationReportApi = {
  async getReports(status?: ReportStatus) {
    const response = await apiClient.get<ApiResponse<PageResponse<ModerationReportSummary>>>('/admin/moderation/reports', { params: { status, size: 100 } })
    return response.data.data
  },
  async getReport(reportId: number) {
    const response = await apiClient.get<ApiResponse<ModerationReportDetail>>(`/admin/moderation/reports/${reportId}`)
    return response.data.data
  },
  async reviewReport(reportId: number, decision: ReviewDecision) {
    const response = await apiClient.patch<ApiResponse<ModerationReportSummary>>(`/admin/moderation/reports/${reportId}/review`, { decision })
    return response.data.data
  },
}
