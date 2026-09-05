import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { useAuthStore } from '@/features/auth/store'
import { server } from '@/mocks/server'
import { loginAs } from '@/test/authHelpers'
import { createTestQueryClient } from '@/test/test-utils'

function renderDashboard() {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardPage />
    </QueryClientProvider>,
  )
}

describe('DashboardPage', () => {
  beforeEach(async () => {
    const { user, token } = await loginAs('admin')
    useAuthStore.setState({ user, token })
  })

  it('shows a loading state before data arrives', () => {
    renderDashboard()
    expect(screen.queryByText('Total Shops')).not.toBeInTheDocument()
  })

  it('shows summary cards and charts once data loads', async () => {
    renderDashboard()

    expect(await screen.findByText('Total Shops')).toBeInTheDocument()
    expect(screen.getByText('9')).toBeInTheDocument() // seeded shop count

    expect(screen.getByText('Product Stock Status')).toBeInTheDocument()
    expect(screen.getByText('Top 5 Shops by Inventory Value')).toBeInTheDocument()

    // Seed data guarantees at least one low-stock product per stocked shop.
    const lowStockValue = screen.getByText('Low-Stock Products').nextElementSibling
    expect(lowStockValue?.textContent).not.toBe('0')
  })

  it('shows an error state with a working retry action', async () => {
    server.use(
      http.get('/api/products', () => HttpResponse.json({ message: 'Server error' }, { status: 500 })),
    )

    renderDashboard()

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument()

    server.resetHandlers()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(await screen.findByText('Total Shops')).toBeInTheDocument()
  })

  it('shows an empty state when there are no shops or products', async () => {
    server.use(
      http.get('/api/shops', () =>
        HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 1000, totalPages: 1 }),
      ),
      http.get('/api/products', () =>
        HttpResponse.json({ data: [], total: 0, page: 1, pageSize: 1000, totalPages: 1 }),
      ),
    )

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('No data yet')).toBeInTheDocument()
    })
  })
})
