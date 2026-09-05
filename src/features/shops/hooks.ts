import { useQuery } from '@tanstack/react-query'
import { listShops } from '@/features/shops/api'
import type { ShopListParams } from '@/features/shops/types'
import { queryKeys } from '@/lib/queryKeys'

export function useShops(params: ShopListParams) {
  return useQuery({
    queryKey: queryKeys.shops.list(params),
    queryFn: () => listShops(params),
    placeholderData: (previousData) => previousData,
  })
}
