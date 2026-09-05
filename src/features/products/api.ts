import type { ProductListParams } from '@/features/products/types'
import { apiClient, buildQueryString } from '@/lib/api/client'
import type { PaginatedResponse } from '@/types/api'
import type { Product } from '@/types/domain'

export function listProducts(params: ProductListParams = {}): Promise<PaginatedResponse<Product>> {
  return apiClient.get<PaginatedResponse<Product>>(`/products${buildQueryString(params)}`)
}
