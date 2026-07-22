export interface ApiResponse<T> { data: T; message?: string }
export interface PageResponse<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number }
export interface ApiError { code: string; message: string; fieldErrors?: Record<string, string> }
