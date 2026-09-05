import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/features/auth/store'
import { ShopListPage } from '@/features/shops/ShopListPage'
import { loginAs } from '@/test/authHelpers'
import { createTestQueryClient } from '@/test/test-utils'

function renderPage(initialEntry = '/shops') {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <ShopListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function tableBody() {
  return screen.getAllByRole('table')[0].querySelector('tbody')!
}

describe('ShopListPage', () => {
  describe('as an admin', () => {
    beforeEach(async () => {
      const { user, token } = await loginAs('admin')
      useAuthStore.setState({ user, token })
    })

    it('lists shops with a working "New Shop" action', async () => {
      renderPage()
      expect(await screen.findByText('Urban Threads')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /new shop/i })).toHaveAttribute('href', '/shops/new')
    })

    it('filters by search after debouncing', async () => {
      renderPage()
      await screen.findByText('Urban Threads')

      fireEvent.change(screen.getByLabelText(/search shops by name/i), {
        target: { value: 'kitchen' },
      })

      // Wait for the debounced, filtered fetch to actually land — not just for
      // Kitchen & Co. to appear, since it's also visible in the unfiltered
      // placeholder data shown while that fetch is still in flight.
      await waitFor(() => {
        expect(within(tableBody()).queryByText('Urban Threads')).not.toBeInTheDocument()
      })
      expect(within(tableBody()).getByText('Kitchen & Co.')).toBeInTheDocument()
    })

    it('shows a no-results state for a search with no matches', async () => {
      renderPage()
      await screen.findByText('Urban Threads')

      fireEvent.change(screen.getByLabelText(/search shops by name/i), {
        target: { value: 'no such shop' },
      })

      expect(await screen.findByText(/no shops match your search/i)).toBeInTheDocument()
    })

    it('paginates results', async () => {
      renderPage()
      await screen.findByText('Urban Threads')

      expect(screen.getByText(/showing 1-9 of 9/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^previous$/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /^next$/i })).toBeDisabled()
    })

    it('shows edit links for admins', async () => {
      renderPage()
      await screen.findByText('Urban Threads')
      expect(screen.getAllByLabelText(/^edit /i).length).toBeGreaterThan(0)
    })
  })

  describe('as a viewer', () => {
    beforeEach(async () => {
      const { user, token } = await loginAs('viewer')
      useAuthStore.setState({ user, token })
    })

    it('hides the New Shop action and edit links', async () => {
      renderPage()
      await screen.findByText('Urban Threads')

      expect(screen.queryByRole('link', { name: /new shop/i })).not.toBeInTheDocument()
      expect(screen.queryByLabelText(/^edit /i)).not.toBeInTheDocument()
    })
  })
})
