import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  adjustInventory,
  createProduct,
  deleteProduct,
  getInventoryHistory,
  getProduct,
  listProducts,
  updateProduct,
} from '@/features/products/api'
import type { ProductListParams } from '@/features/products/types'
import { queryKeys } from '@/lib/queryKeys'
import type {
  InventoryAdjustmentRequestBody,
  InventoryAdjustmentResponseBody,
  ProductInputBody,
} from '@/types/api'
import type { Product } from '@/types/domain'

export function useProducts(params: ProductListParams) {
  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => listProducts(params),
    placeholderData: (previousData) => previousData,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: () => getProduct(id),
  })
}

export function useInventoryHistory(productId: string) {
  return useQuery({
    queryKey: queryKeys.products.inventoryHistory(productId),
    queryFn: () => getInventoryHistory(productId),
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ProductInputBody) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all })
      toast.success('Product created')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ProductInputBody) => updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all })
      toast.success('Product updated')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

interface AdjustInventoryContext {
  previousProduct?: Product
}

/**
 * Optimistically applies the stock change to the cached product detail so the
 * UI updates instantly, then rolls back on failure. Broader data (lists,
 * dashboard, shop stats, history) is simply invalidated on settle rather than
 * optimistically patched — those are read in more places than is worth
 * hand-updating, and a short refetch delay there is unnoticeable.
 */
export function useAdjustInventory(productId: string) {
  const queryClient = useQueryClient()

  return useMutation<
    InventoryAdjustmentResponseBody,
    Error,
    InventoryAdjustmentRequestBody,
    AdjustInventoryContext
  >({
    mutationFn: (input: InventoryAdjustmentRequestBody) => adjustInventory(productId, input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.products.detail(productId) })
      const previousProduct = queryClient.getQueryData<Product>(queryKeys.products.detail(productId))

      if (previousProduct) {
        const newStock =
          input.type === 'increase'
            ? previousProduct.stock + input.amount
            : previousProduct.stock - input.amount
        queryClient.setQueryData<Product>(queryKeys.products.detail(productId), {
          ...previousProduct,
          stock: newStock,
          updatedAt: new Date().toISOString(),
        })
      }

      return { previousProduct }
    },
    onError: (error, _input, context) => {
      if (context?.previousProduct) {
        queryClient.setQueryData(queryKeys.products.detail(productId), context.previousProduct)
      }
      toast.error(error.message)
    },
    onSuccess: () => {
      toast.success('Stock adjusted')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.products.inventoryHistory(productId) })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.shops.all })
      toast.success('Product deleted')
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
