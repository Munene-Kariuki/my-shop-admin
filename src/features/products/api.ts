import type { ProductListParams } from '@/features/products/types'
import { apiClient, buildQueryString } from '@/lib/api/client'
import type { PaginatedResponse } from '@/types/api'
import type { Product } from '@/types/domain'

export function listProducts(params: ProductListParams = {}): Promise<PaginatedResponse<Product>> {
  return apiClient.get<PaginatedResponse<Product>>(`/products${buildQueryString(params)}`)
}

export function getProduct(id: string): Promise<Product> {
  return apiClient.get<Product>(`/products/${id}`)
}

export function deleteProduct(id: string): Promise<void> {
  return apiClient.delete(`/products/${id}`)
}
