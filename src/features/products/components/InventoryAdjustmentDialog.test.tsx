import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/features/auth/store'
import { ProductDetailsPage } from '@/features/products/ProductDetailsPage'
import { db } from '@/mocks/db'
import { server } from '@/mocks/server'
import { loginAs } from '@/test/authHelpers'
import { createTestQueryClient } from '@/test/test-utils'

const PRODUCT_ID = 'product-UT-0001'

function renderPage() {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/products/${PRODUCT_ID}`]}>
        <Routes>
          <Route path="/shops/:shopId" element={<div>Shop Marker</div>} />
          <Route path="/products/:productId" element={<ProductDetailsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function currentStock() {
  return db.products.find((p) => p.id === PRODUCT_ID)!.stock
}

async function openDialog() {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /adjust stock/i }))
  await screen.findByLabelText(/quantity/i)
  return user
}

describe('InventoryAdjustmentDialog', () => {
  beforeEach(async () => {
    const { user, token } = await loginAs('admin')
    useAuthStore.setState({ user, token })
  })

  it('previews the resulting stock level as quantity changes', async () => {
    renderPage()
    await screen.findByText('Classic Crewneck Tee')
    const stock = currentStock()

    const user = await openDialog()
    const quantityInput = screen.getByLabelText(/quantity/i)
    await user.clear(quantityInput)
    await user.type(quantityInput, '10')

    expect(await screen.findByText(String(stock + 10))).toBeInTheDocument()
  })

  it('rejects a decrease that would make stock negative', async () => {
    renderPage()
    await screen.findByText('Classic Crewneck Tee')
    const stock = currentStock()

    const user = await openDialog()
    await user.click(screen.getByRole('button', { name: /^decrease$/i }))
    const quantityInput = screen.getByLabelText(/quantity/i)
    await user.clear(quantityInput)
    await user.type(quantityInput, String(stock + 50))
    await user.type(screen.getByLabelText(/reason/i), 'Too much')
    await user.click(screen.getByRole('button', { name: /^adjust stock$/i }))

    expect(await screen.findByText(/would result in negative stock/i)).toBeInTheDocument()
  })

  it('rejects a missing reason', async () => {
    renderPage()
    await screen.findByText('Classic Crewneck Tee')

    const user = await openDialog()
    const quantityInput = screen.getByLabelText(/quantity/i)
    await user.clear(quantityInput)
    await user.type(quantityInput, '5')
    await user.click(screen.getByRole('button', { name: /^adjust stock$/i }))

    expect(await screen.findByText(/provide a reason/i)).toBeInTheDocument()
  })

  it('rejects a zero quantity', async () => {
    renderPage()
    await screen.findByText('Classic Crewneck Tee')

    const user = await openDialog()
    const quantityInput = screen.getByLabelText(/quantity/i)
    await user.clear(quantityInput)
    await user.type(quantityInput, '0')
    await user.type(screen.getByLabelText(/reason/i), 'Testing')
    await user.click(screen.getByRole('button', { name: /^adjust stock$/i }))

    expect(await screen.findByText(/greater than zero/i)).toBeInTheDocument()
  })

  it('applies the change and closes the dialog on success', async () => {
    renderPage()
    await screen.findByText('Classic Crewneck Tee')
    const stock = currentStock()

    const user = await openDialog()
    const quantityInput = screen.getByLabelText(/quantity/i)
    await user.clear(quantityInput)
    await user.type(quantityInput, '5')
    await user.type(screen.getByLabelText(/reason/i), 'Stock count correction')
    await user.click(screen.getByRole('button', { name: /^adjust stock$/i }))

    await waitFor(() => {
      expect(screen.queryByLabelText(/quantity/i)).not.toBeInTheDocument()
    })
    expect(await screen.findByText(String(stock + 5))).toBeInTheDocument()
    expect(await screen.findByText('Stock count correction')).toBeInTheDocument()
  })

  it('rolls back the optimistic update if the request fails', async () => {
    server.use(
      http.post('/api/products/:id/inventory-adjustments', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    )

    renderPage()
    await screen.findByText('Classic Crewneck Tee')
    const stock = currentStock()

    const user = await openDialog()
    const quantityInput = screen.getByLabelText(/quantity/i)
    await user.clear(quantityInput)
    await user.type(quantityInput, '5')
    await user.type(screen.getByLabelText(/reason/i), 'Stock count correction')
    await user.click(screen.getByRole('button', { name: /^adjust stock$/i }))

    // Rolls back to the original value once the failed request settles.
    await waitFor(() => {
      expect(screen.getByText(String(stock))).toBeInTheDocument()
    })
  })
})
