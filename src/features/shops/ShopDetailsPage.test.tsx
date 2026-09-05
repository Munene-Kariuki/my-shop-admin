import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/features/auth/store'
import { ShopDetailsPage } from '@/features/shops/ShopDetailsPage'
import { loginAs } from '@/test/authHelpers'
import { createTestQueryClient } from '@/test/test-utils'
import type { Role } from '@/types/domain'

function renderAt(initialEntry: string) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/shops" element={<div>Shops List Marker</div>} />
          <Route path="/shops/:shopId" element={<ShopDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

async function loginAndSetRole(role: Role) {
  const { user, token } = await loginAs(role)
  useAuthStore.setState({ user, token })
}

describe('ShopDetailsPage', () => {
  beforeEach(() => loginAndSetRole('admin'))

  it('shows shop info, stats, and its products', async () => {
    renderAt('/shops/shop-1')

    expect(await screen.findByRole('heading', { name: 'Urban Threads' })).toBeInTheDocument()
    expect(screen.getByText('Total Products')).toBeInTheDocument()
    expect(screen.getByText('Total Stock')).toBeInTheDocument()
    expect(screen.getByText('Total Inventory Value')).toBeInTheDocument()
    expect(await screen.findByText('Classic Crewneck Tee')).toBeInTheDocument()
  })

  it('paginates the products belonging to this shop', async () => {
    renderAt('/shops/shop-1')
    await screen.findByText('Classic Crewneck Tee')

    // Urban Threads has 12 seeded products, so a 10-per-page list has a second page.
    expect(screen.getByText(/showing 1-10 of 12/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^next$/i })).not.toBeDisabled()
  })

  it('filters this shop\'s products by search', async () => {
    renderAt('/shops/shop-1')
    await screen.findByText('Classic Crewneck Tee')

    fireEvent.change(screen.getByLabelText(/search this shop's products/i), {
      target: { value: 'denim' },
    })

    await waitFor(() => {
      expect(screen.queryByText('Classic Crewneck Tee')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Slim Fit Denim Jeans')).toBeInTheDocument()
  })

  it('shows a not-found state for an unknown shop with a link back to the list', async () => {
    renderAt('/shops/does-not-exist')

    expect(await screen.findByText('Shop not found')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to shops/i })).toHaveAttribute('href', '/shops')
  })

  it('shows the Edit Shop and Delete Shop actions for admins', async () => {
    renderAt('/shops/shop-1')
    expect(await screen.findByRole('link', { name: /edit shop/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete shop/i })).toBeInTheDocument()
  })
})

describe('ShopDetailsPage as a viewer', () => {
  beforeEach(() => loginAndSetRole('viewer'))

  it('hides the Edit Shop and Delete Shop actions', async () => {
    renderAt('/shops/shop-1')
    await screen.findByRole('heading', { name: 'Urban Threads' })
    expect(screen.queryByRole('link', { name: /edit shop/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /delete shop/i })).not.toBeInTheDocument()
  })
})
