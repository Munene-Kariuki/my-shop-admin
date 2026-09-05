import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/features/auth/store'
import { ProductDetailsPage } from '@/features/products/ProductDetailsPage'
import { authHeaders, loginAs } from '@/test/authHelpers'
import { createTestQueryClient } from '@/test/test-utils'
import type { Role } from '@/types/domain'

function renderAt(productId: string) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/products/${productId}`]}>
        <Routes>
          <Route path="/products" element={<div>Products List Marker</div>} />
          <Route path="/shops/:shopId" element={<div>Shop Details Marker</div>} />
          <Route path="/products/:productId" element={<ProductDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

async function loginAndSetRole(role: Role) {
  const { user, token } = await loginAs(role)
  useAuthStore.setState({ user, token })
  return token
}

describe('ProductDetailsPage', () => {
  describe('as an admin', () => {
    beforeEach(() => loginAndSetRole('admin'))

    it('shows product info, shop link, and stats', async () => {
      renderAt('product-UT-0001')

      expect(await screen.findByText('Classic Crewneck Tee')).toBeInTheDocument()
      expect(screen.getByText(/sku ut-0001/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'Urban Threads' })).toHaveAttribute(
        'href',
        '/shops/shop-1',
      )
      expect(screen.getByText('Price')).toBeInTheDocument()
      expect(screen.getByText('Current Stock')).toBeInTheDocument()
      expect(screen.getByText('Inventory Value')).toBeInTheDocument()
    })

    it('shows an empty state when there is no adjustment history', async () => {
      renderAt('product-UT-0001')
      expect(await screen.findByText(/no adjustments yet/i)).toBeInTheDocument()
    })

    it('shows adjustment history once an adjustment has been made', async () => {
      const token = await loginAndSetRole('admin')
      await fetch('/api/products/product-UT-0001/inventory-adjustments', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ type: 'increase', amount: 15, reason: 'New shipment' }),
      })

      renderAt('product-UT-0001')

      expect(await screen.findByText('New shipment')).toBeInTheDocument()
      expect(screen.getByText('+15')).toBeInTheDocument()
    })

    it('shows a not-found state for an unknown product', async () => {
      renderAt('does-not-exist')
      expect(await screen.findByText(/product not found/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /back to products/i })).toHaveAttribute(
        'href',
        '/products',
      )
    })

    it('shows an edit link and a disabled adjust-stock action', async () => {
      renderAt('product-UT-0001')
      await screen.findByText('Classic Crewneck Tee')

      expect(screen.getByRole('link', { name: /edit product/i })).toHaveAttribute(
        'href',
        '/products/product-UT-0001/edit',
      )
      expect(screen.getByRole('button', { name: /adjust stock/i })).toBeDisabled()
    })
  })

  describe('as a viewer', () => {
    beforeEach(() => loginAndSetRole('viewer'))

    it('hides the edit and adjust-stock actions', async () => {
      renderAt('product-UT-0001')
      await screen.findByText('Classic Crewneck Tee')

      expect(screen.queryByRole('link', { name: /edit product/i })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /adjust stock/i })).not.toBeInTheDocument()
    })
  })
})
