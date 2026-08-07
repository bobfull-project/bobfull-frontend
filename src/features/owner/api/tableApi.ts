import { apiClient } from '@/lib/api/client'

export interface OwnerTable {
  tableId: number
  restaurantId: number
  displayNumber: number
  capacity: number
  status: string
}

interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export async function getTables(restaurantId: number): Promise<OwnerTable[]> {
  const response = await apiClient.get<{ data: PageResponse<OwnerTable> }>(
    `/owner/restaurants/${restaurantId}/tables`, { params: { size: 100 } },
  )
  return response.data.data.content
}

export interface TableBulkRegisterResponse {
  createdTableCount: number
  tables: OwnerTable[]
}

export async function registerTablesBulk(
  restaurantId: number,
  capacity: number,
  count: number,
): Promise<TableBulkRegisterResponse> {
  const response = await apiClient.post<{ data: TableBulkRegisterResponse }>(
    `/owner/restaurants/${restaurantId}/tables/bulk`, { capacity, count },
  )
  return response.data.data
}

export async function updateTable(tableId: number, capacity: number): Promise<void> {
  await apiClient.patch(`/owner/tables/${tableId}`, { capacity })
}

export async function deleteTable(tableId: number): Promise<void> {
  await apiClient.delete(`/owner/tables/${tableId}`)
}
