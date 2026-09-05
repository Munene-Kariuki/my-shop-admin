import type { ProductStatus, StockStatus } from '@/types/domain'

export interface ProductListParams {
  search?: string
  shopId?: string
  category?: string
  status?: ProductStatus
  stockStatus?: StockStatus
  sort?: string
  sortDir?: 'asc' | 'desc'
  page?: number
  pageSize?: number
  [key: string]: string | number | boolean | undefined
}
