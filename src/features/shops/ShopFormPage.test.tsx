import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { RequireRole } from '@/features/auth/RequireRole'
import { useAuthStore } from '@/features/auth/store'
import { ShopFormPage } from '@/features/shops/ShopFormPage'
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
          <Route path="/shops" element={<div>Shops List Marker</div>} />
          <Route path="/shops/:shopId" element={<div>Shop Details Marker</div>} />
          <Route path="/dashboard" element={<div>Dashboard Marker</div>} />
          <Route
            path="/shops/new"
            element={
              <RequireRole allow={['admin']}>
                <ShopFormPage />
              </RequireRole>
            }
          />
          <Route
            path="/shops/:shopId/edit"
            element={
              <RequireRole allow={['admin']}>
                <ShopFormPage />
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

describe('ShopFormPage', () => {
  describe('create mode', () => {
    beforeEach(() => loginAndSetRole('admin'))

    it('shows a validation error for a missing name', async () => {
      const user = userEvent.setup()
      renderAt('/shops/new')

      await user.click(screen.getByRole('button', { name: /create shop/i }))
      expect(await screen.findByText(/shop name is required/i)).toBeInTheDocument()
    })

    it('creates a shop and navigates to its details page', async () => {
      const user = userEvent.setup()
      renderAt('/shops/new')

      await user.type(screen.getByLabelText(/shop name/i), 'Test Shop')
      await user.click(screen.getByRole('button', { name: /create shop/i }))

      expect(await screen.findByText('Shop Details Marker')).toBeInTheDocument()
    })
  })

  describe('edit mode', () => {
    beforeEach(() => loginAndSetRole('admin'))

    it('loads the existing shop into the form', async () => {
      renderAt('/shops/shop-2/edit')
      expect(await screen.findByDisplayValue('Kitchen & Co.')).toBeInTheDocument()
    })

    it('updates the shop and navigates to its details page', async () => {
      const user = userEvent.setup()
      renderAt('/shops/shop-2/edit')
      await screen.findByDisplayValue('Kitchen & Co.')

      const nameInput = screen.getByLabelText(/shop name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Kitchen & Co. Updated')
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      expect(await screen.findByText('Shop Details Marker')).toBeInTheDocument()
    })

    it('preserves the user\'s edits when the update request fails', async () => {
      server.use(
        http.patch('/api/shops/:id', () => HttpResponse.json({ message: 'Server error' }, { status: 500 })),
      )

      const user = userEvent.setup()
      renderAt('/shops/shop-2/edit')
      await screen.findByDisplayValue('Kitchen & Co.')

      const nameInput = screen.getByLabelText(/shop name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Unsaved Edit')
      await user.click(screen.getByRole('button', { name: /save changes/i }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /save changes/i })).not.toBeDisabled()
      })
      expect(nameInput).toHaveValue('Unsaved Edit')
    })
  })

  describe('role protection', () => {
    it('redirects a viewer away from the create-shop route', async () => {
      await loginAndSetRole('viewer')
      renderAt('/shops/new')
      expect(await screen.findByText('Dashboard Marker')).toBeInTheDocument()
    })
  })
})
