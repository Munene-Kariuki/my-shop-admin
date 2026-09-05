export interface ShopListParams {
  search?: string
  sort?: string
  sortDir?: 'asc' | 'desc'
  page?: number
  pageSize?: number
  [key: string]: string | number | boolean | undefined
}
