import type { ShopListParams } from '@/features/shops/types'
import { apiClient, buildQueryString } from '@/lib/api/client'
import type { ShopInputBody, PaginatedResponse } from '@/types/api'
import type { ShopWithStats } from '@/types/domain'

export function listShops(params: ShopListParams = {}): Promise<PaginatedResponse<ShopWithStats>> {
  return apiClient.get<PaginatedResponse<ShopWithStats>>(`/shops${buildQueryString(params)}`)
}

export function getShop(id: string): Promise<ShopWithStats> {
  return apiClient.get<ShopWithStats>(`/shops/${id}`)
}

export function createShop(input: ShopInputBody): Promise<ShopWithStats> {
  return apiClient.post<ShopWithStats>('/shops', input)
}

export function updateShop(id: string, input: ShopInputBody): Promise<ShopWithStats> {
  return apiClient.patch<ShopWithStats>(`/shops/${id}`, input)
}
