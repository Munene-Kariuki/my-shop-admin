import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { createShop, deleteShop, getShop, listShops, updateShop } from '@/features/shops/api'
import type { ShopListParams } from '@/features/shops/types'
import { ApiError } from '@/lib/api/client'
import { queryKeys } from '@/lib/queryKeys'
import type { ShopInputBody } from '@/types/api'

export function useShops(params: ShopListParams) {
  return useQuery({
    queryKey: queryKeys.shops.list(params),
    queryFn: () => listShops(params),
    placeholderData: (previousData) => previousData,
  })
}

export function useShop(id: string) {
  return useQuery({
    queryKey: queryKeys.shops.detail(id),
    queryFn: () => getShop(id),
  })
}

export function useCreateShop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ShopInputBody) => createShop(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all })
      toast.success('Shop created')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateShop(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ShopInputBody) => updateShop(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all })
      toast.success('Shop updated')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteShop() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteShop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all })
      toast.success('Shop deleted')
    },
    onError: (error) => {
      // A 409 (blocked-by-products) is shown inline by DeleteShopDialog instead.
      if (error instanceof ApiError && error.status === 409) return
      toast.error(error.message)
    },
  })
}
