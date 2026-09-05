import { QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/features/auth/store'
import { useDashboard } from '@/features/dashboard/hooks'
import { db } from '@/mocks/db'
import { loginAs } from '@/test/authHelpers'
import { createTestQueryClient } from '@/test/test-utils'
import { getStockStatus } from '@/types/domain'

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = createTestQueryClient()
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

describe('useDashboard', () => {
  beforeEach(async () => {
    const { user, token } = await loginAs('admin')
    useAuthStore.setState({ user, token })
  })

  it('derives totals that match the underlying products/shops', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const expectedLowStock = db.products.filter((p) => getStockStatus(p.stock) === 'low-stock').length
    const expectedOutOfStock = db.products.filter(
      (p) => getStockStatus(p.stock) === 'out-of-stock',
    ).length
    const expectedTotalStock = db.products.reduce((sum, p) => sum + p.stock, 0)
    const expectedTotalValue = db.products.reduce((sum, p) => sum + p.price * p.stock, 0)

    expect(result.current.summary.totalShops).toBe(db.shops.length)
    expect(result.current.summary.totalProducts).toBe(db.products.length)
    expect(result.current.summary.totalStock).toBe(expectedTotalStock)
    expect(result.current.summary.totalInventoryValue).toBeCloseTo(expectedTotalValue, 2)
    expect(result.current.summary.lowStockCount).toBe(expectedLowStock)
    expect(result.current.summary.outOfStockCount).toBe(expectedOutOfStock)
  })

  it('returns the top 5 shops sorted by inventory value descending', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.topShops.length).toBeLessThanOrEqual(5)
    const values = result.current.topShops.map((s) => s.totalInventoryValue)
    expect(values).toEqual([...values].sort((a, b) => b - a))
  })

  it('sums stock-status counts to the total product count', async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper })
    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const sum = result.current.stockStatusCounts.reduce((total, entry) => total + entry.count, 0)
    expect(sum).toBe(db.products.length)
  })
})
