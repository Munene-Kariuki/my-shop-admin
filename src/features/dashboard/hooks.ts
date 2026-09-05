import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { listShops } from '@/features/shops/api'
import { listProducts } from '@/features/products/api'
import { queryKeys } from '@/lib/queryKeys'
import { getStockStatus } from '@/types/domain'
import type { ShopWithStats, StockStatus } from '@/types/domain'

// No pagination needed here — the dashboard aggregates across every
// shop/product, so it fetches the full lists once and derives everything
// client-side from the same API data the list pages use.
const DASHBOARD_LIST_PARAMS = { pageSize: 1000 }

export interface DashboardSummary {
  totalShops: number
  totalProducts: number
  totalStock: number
  totalInventoryValue: number
  lowStockCount: number
  outOfStockCount: number
}

export interface StockStatusCount {
  status: StockStatus
  label: string
  count: number
}

export function useDashboard() {
  const shopsQuery = useQuery({
    queryKey: queryKeys.shops.list(DASHBOARD_LIST_PARAMS),
    queryFn: () => listShops(DASHBOARD_LIST_PARAMS),
  })
  const productsQuery = useQuery({
    queryKey: queryKeys.products.list(DASHBOARD_LIST_PARAMS),
    queryFn: () => listProducts(DASHBOARD_LIST_PARAMS),
  })

  const shopsData = shopsQuery.data?.data
  const productsData = productsQuery.data?.data
  const shops = useMemo(() => shopsData ?? [], [shopsData])
  const products = useMemo(() => productsData ?? [], [productsData])

  const summary = useMemo<DashboardSummary>(() => {
    let totalStock = 0
    let totalInventoryValue = 0
    let lowStockCount = 0
    let outOfStockCount = 0

    for (const product of products) {
      totalStock += product.stock
      totalInventoryValue += product.price * product.stock
      const status = getStockStatus(product.stock)
      if (status === 'low-stock') lowStockCount += 1
      if (status === 'out-of-stock') outOfStockCount += 1
    }

    return {
      totalShops: shops.length,
      totalProducts: products.length,
      totalStock,
      totalInventoryValue,
      lowStockCount,
      outOfStockCount,
    }
  }, [shops, products])

  const stockStatusCounts = useMemo<StockStatusCount[]>(() => {
    const counts: Record<StockStatus, number> = {
      'in-stock': 0,
      'low-stock': 0,
      'out-of-stock': 0,
    }
    for (const product of products) {
      counts[getStockStatus(product.stock)] += 1
    }
    return [
      { status: 'in-stock', label: 'In Stock', count: counts['in-stock'] },
      { status: 'low-stock', label: 'Low Stock', count: counts['low-stock'] },
      { status: 'out-of-stock', label: 'Out of Stock', count: counts['out-of-stock'] },
    ]
  }, [products])

  const topShops = useMemo<ShopWithStats[]>(() => {
    return [...shops].sort((a, b) => b.totalInventoryValue - a.totalInventoryValue).slice(0, 5)
  }, [shops])

  const isLoading = shopsQuery.isPending || productsQuery.isPending

  return {
    isLoading,
    isError: shopsQuery.isError || productsQuery.isError,
    error: shopsQuery.error ?? productsQuery.error,
    isEmpty: !isLoading && shops.length === 0 && products.length === 0,
    refetch: () => {
      shopsQuery.refetch()
      productsQuery.refetch()
    },
    summary,
    stockStatusCounts,
    topShops,
  }
}
