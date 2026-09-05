import type { ShopListParams } from '@/features/shops/types'
import { apiClient, buildQueryString } from '@/lib/api/client'
import type { PaginatedResponse } from '@/types/api'
import type { ShopWithStats } from '@/types/domain'

export function listShops(params: ShopListParams = {}): Promise<PaginatedResponse<ShopWithStats>> {
  return apiClient.get<PaginatedResponse<ShopWithStats>>(`/shops${buildQueryString(params)}`)
}
