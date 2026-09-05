import { useQuery } from '@tanstack/react-query'
import { listProducts } from '@/features/products/api'
import type { ProductListParams } from '@/features/products/types'
import { queryKeys } from '@/lib/queryKeys'

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => listProducts(params),
    placeholderData: (previousData) => previousData,
  })
}
