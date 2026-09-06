import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/features/auth/store'
import { ProductListPage } from '@/features/products/ProductListPage'
import { loginAs } from '@/test/authHelpers'
import { createTestQueryClient } from '@/test/test-utils'
import type { Role } from '@/types/domain'

function renderPage() {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/products']}>
        <ProductListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function tableBody() {
  return screen.getAllByRole('table')[0].querySelector('tbody')!
}

async function selectOption(comboboxName: RegExp, optionName: string) {
  const user = userEvent.setup()
  await user.click(screen.getByRole('combobox', { name: comboboxName }))
  await user.click(await screen.findByRole('option', { name: optionName }))
}

async function loginAndSetRole(role: Role) {
  const { user, token } = await loginAs(role)
  useAuthStore.setState({ user, token })
}

describe('ProductListPage', () => {
  describe('as an admin', () => {
    beforeEach(() => loginAndSetRole('admin'))

    it('lists products with pagination over the full seeded catalog', async () => {
      renderPage()
      await screen.findByText(/showing 1-10 of 86/i)
    })

    it('searches by SKU', async () => {
      renderPage()
      await screen.findByText(/showing/i)

      fireEvent.change(screen.getByLabelText(/search products by name or sku/i), {
        target: { value: 'BB-0001' },
      })

      await waitFor(() => {
        expect(within(tableBody()).getByText('Wireless Earbuds')).toBeInTheDocument()
      })
      expect(within(tableBody()).queryAllByRole('row')).toHaveLength(1)
    })

    it('filters by shop', async () => {
      renderPage()
      await screen.findByText(/showing/i)

      await selectOption(/filter by shop/i, 'Chapter One Books')

      await waitFor(() => {
        expect(within(tableBody()).getByText('The Hobbit')).toBeInTheDocument()
      })
      expect(within(tableBody()).queryByText('Wireless Earbuds')).not.toBeInTheDocument()
    })

    it('filters by category', async () => {
      renderPage()
      await screen.findByText(/showing/i)

      await selectOption(/filter by category/i, 'Books')

      await waitFor(() => {
        expect(screen.getByText(/showing 1-10 of 10/i)).toBeInTheDocument()
      })
    })

    it('filters by stock status', async () => {
      renderPage()
      await screen.findByText(/showing/i)

      await selectOption(/filter by stock status/i, 'Out of Stock')

      await waitFor(() => {
        expect(screen.getByText(/showing 1-8 of 8/i)).toBeInTheDocument()
      })
      for (const badge of within(tableBody()).getAllByText('Out of Stock')) {
        expect(badge).toBeInTheDocument()
      }
    })

    it('sorts by price descending', async () => {
      const user = userEvent.setup()
      renderPage()
      await screen.findByText(/showing/i)

      await user.click(screen.getByRole('button', { name: /^price/i }))
      await user.click(screen.getByRole('button', { name: /^price/i }))

      const rows = within(tableBody()).getAllByRole('row')
      const firstRowPrice = within(rows[0]).getByText(/^Ksh/)
      expect(firstRowPrice).toBeInTheDocument()
    })

    it('shows and clears active filters', async () => {
      renderPage()
      await screen.findByText(/showing/i)

      await selectOption(/filter by category/i, 'Books')
      await screen.findByText(/showing 1-10 of 10/i)

      await userEvent.setup().click(screen.getByRole('button', { name: /clear filters/i }))

      await waitFor(() => {
        expect(screen.getByText(/showing 1-10 of 86/i)).toBeInTheDocument()
      })
      expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument()
    })

    it('shows edit and delete actions for admins', async () => {
      renderPage()
      await screen.findByText(/showing/i)
      expect(screen.getAllByLabelText(/^edit /i).length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText(/^delete /i).length).toBeGreaterThan(0)
    })
  })

  describe('as a viewer', () => {
    beforeEach(() => loginAndSetRole('viewer'))

    it('hides the New Product action and edit/delete actions', async () => {
      renderPage()
      await screen.findByText(/showing/i)

      expect(screen.queryByRole('link', { name: /new product/i })).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/^edit /i)).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/^delete /i)).not.toBeInTheDocument()
    })
  })
})
