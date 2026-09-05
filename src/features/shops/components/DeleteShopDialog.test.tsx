import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeleteShopDialog } from '@/features/shops/components/DeleteShopDialog'
import { useAuthStore } from '@/features/auth/store'
import { db } from '@/mocks/db'
import { loginAs } from '@/test/authHelpers'
import { createTestQueryClient } from '@/test/test-utils'
import type { ShopWithStats } from '@/types/domain'

function shopWithProducts(): ShopWithStats {
  const shop = db.shops.find((s) => s.id === 'shop-1')!
  return { ...shop, productCount: 12, totalStock: 100, totalInventoryValue: 5000 }
}

function emptyShop(): ShopWithStats {
  const shop = db.shops.find((s) => s.id === 'shop-9')!
  return { ...shop, productCount: 0, totalStock: 0, totalInventoryValue: 0 }
}

function renderDialog(shop: ShopWithStats, onDeleted?: () => void) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <DeleteShopDialog shop={shop} onDeleted={onDeleted} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DeleteShopDialog', () => {
  beforeEach(async () => {
    const { user, token } = await loginAs('admin')
    useAuthStore.setState({ user, token })
  })

  it('shows the shop name and an irreversibility warning', async () => {
    const user = userEvent.setup()
    renderDialog(emptyShop())

    await user.click(screen.getByRole('button', { name: /delete the empty shelf/i }))

    expect(screen.getByText(/delete "the empty shelf"\?/i)).toBeInTheDocument()
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument()
  })

  it('closes without deleting when cancelled', async () => {
    const user = userEvent.setup()
    renderDialog(emptyShop())

    await user.click(screen.getByRole('button', { name: /delete the empty shelf/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByText(/cannot be undone/i)).not.toBeInTheDocument()
    })
    expect(db.shops.some((s) => s.id === 'shop-9')).toBe(true)
  })

  it('deletes a shop with no products and calls onDeleted', async () => {
    const onDeleted = vi.fn()
    const user = userEvent.setup()
    renderDialog(emptyShop(), onDeleted)

    await user.click(screen.getByRole('button', { name: /delete the empty shelf/i }))
    await user.click(screen.getByRole('button', { name: /^delete shop$/i }))

    await waitFor(() => expect(onDeleted).toHaveBeenCalled())
    expect(db.shops.some((s) => s.id === 'shop-9')).toBe(false)
  })

  it('blocks deletion of a shop with products and offers a path to view them', async () => {
    const user = userEvent.setup()
    renderDialog(shopWithProducts())

    await user.click(screen.getByRole('button', { name: /delete urban threads/i }))
    await user.click(screen.getByRole('button', { name: /^delete shop$/i }))

    expect(
      await screen.findByText(/this shop still has products assigned to it/i),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /view this shop's products/i })).toHaveAttribute(
      'href',
      '/shops/shop-1',
    )
    // The dialog stays open — the shop was not removed.
    expect(db.shops.some((s) => s.id === 'shop-1')).toBe(true)
  })

  it('disables the confirm button while the request is in flight', async () => {
    const user = userEvent.setup()
    renderDialog(emptyShop())

    await user.click(screen.getByRole('button', { name: /delete the empty shelf/i }))
    const confirmButton = screen.getByRole('button', { name: /^delete shop$/i })
    await user.click(confirmButton)

    expect(await screen.findByRole('button', { name: /deleting/i })).toBeDisabled()
  })
})
