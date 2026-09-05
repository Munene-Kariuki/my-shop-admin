import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { RequireRole } from '@/features/auth/RequireRole'
import { useAuthStore } from '@/features/auth/store'
import { ProductFormPage } from '@/features/products/ProductFormPage'
import { server } from '@/mocks/server'
import { loginAs } from '@/test/authHelpers'
import { createTestQueryClient } from '@/test/test-utils'
import type { Role } from '@/types/domain'

function renderAt(initialEntry: string) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/products" element={<div>Products List Marker</div>} />
          <Route path="/products/:productId" element={<div>Product Details Marker</div>} />
          <Route path="/dashboard" element={<div>Dashboard Marker</div>} />
          <Route
            path="/products/new"
            element={
              <RequireRole allow={['admin']}>
                <ProductFormPage />
              </RequireRole>
            }
          />
          <Route
            path="/products/:productId/edit"
            element={
              <RequireRole allow={['admin']}>
                <ProductFormPage />
              </RequireRole>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

async function loginAndSetRole(role: Role) {
  const { user, token } = await loginAs(role)
  useAuthStore.setState({ user, token })
}

async function selectOption(comboboxName: RegExp, optionName: string) {
  const user = userEvent.setup()
  await user.click(screen.getByRole('combobox', { name: comboboxName }))
  await user.click(await screen.findByRole('option', { name: optionName }))
}

describe('ProductFormPage', () => {
  describe('create mode', () => {
    beforeEach(() => loginAndSetRole('admin'))

    it('shows a validation error for a missing name', async () => {
      const user = userEvent.setup()
      renderAt('/products/new')

      await user.click(screen.getByRole('button', { name: /create product/i }))
      expect(await screen.findByText(/product name is required/i)).toBeInTheDocument()
    })

    it('shows an image preview once a valid image URL is entered', async () => {
      const user = userEvent.setup()
      renderAt('/products/new')

      expect(screen.queryByAltText(/product image preview/i)).not.toBeInTheDocument()
      await user.type(screen.getByLabelText(/product image url/i), 'https://example.com/pic.png')

      expect(await screen.findByAltText(/product image preview/i)).toHaveAttribute(
        'src',
        'https://example.com/pic.png',
      )
    })

    it('creates a product and navigates to its details page', async () => {
      const user = userEvent.setup()
      renderAt('/products/new')

      await user.type(screen.getByLabelText(/product name/i), 'Test Widget')
      await user.type(screen.getByLabelText(/^sku/i), 'TEST-9999')
      await selectOption(/shop/i, 'Urban Threads')
      await selectOption(/category/i, 'Apparel')
      await user.clear(screen.getByLabelText(/price/i))
      await user.type(screen.getByLabelText(/price/i), '25')
      await user.clear(screen.getByLabelText(/stock level/i))
      await user.type(screen.getByLabelText(/stock level/i), '10')

      await user.click(screen.getByRole('button', { name: /create product/i }))

      expect(await screen.findByText('Product Details Marker')).toBeInTheDocument()
    })
  })

  describe('edit mode', () => {
    beforeEach(() => loginAndSetRole('admin'))

    it('loads the existing product into the form', async () => {
      renderAt('/products/product-UT-0001/edit')
      expect(await screen.findByDisplayValue('Classic Crewneck Tee')).toBeInTheDocument()
      expect(screen.getByDisplayValue('UT-0001')).toBeInTheDocument()
    })

    it("preserves the user's edits when the update request fails", async () => {
      server.use(
        http.patch('/api/products/:id', () =>
          HttpResponse.json({ message: 'Server error' }, { status: 500 }),
        ),
      )

      const user = userEvent.setup()
      renderAt('/products/product-UT-0001/edit')
      await screen.findByDisplayValue('Classic Crewneck Tee')

      const nameInput = screen.getByLabelText(/product name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Unsaved Edit')
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save changes/i })).not.toBeDisabled()
      })
      expect(nameInput).toHaveValue('Unsaved Edit')
    })

    it('shows an inline SKU error when the server reports a duplicate SKU', async () => {
      const user = userEvent.setup()
      renderAt('/products/product-UT-0001/edit')
      await screen.findByDisplayValue('Classic Crewneck Tee')

      const skuInput = screen.getByLabelText(/^sku/i)
      await user.clear(skuInput)
      await user.type(skuInput, 'BB-0001') // already used by a Byte & Bolt product
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      expect(await screen.findByText(/sku already exists/i)).toBeInTheDocument()
    })
  })

  describe('role protection', () => {
    it('redirects a viewer away from the create-product route', async () => {
      await loginAndSetRole('viewer')
      renderAt('/products/new')
      expect(await screen.findByText('Dashboard Marker')).toBeInTheDocument()
    })
  })
})
