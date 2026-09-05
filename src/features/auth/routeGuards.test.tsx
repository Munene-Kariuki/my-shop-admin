import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/PublicOnlyRoute'
import { useAuthStore } from '@/features/auth/store'
import { createTestQueryClient } from '@/test/test-utils'
import { loginAs } from '@/test/authHelpers'

function renderTestRouter(initialEntries: string[]) {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<div>Login Page</div>} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
            <Route path="/dashboard" element={<div>Dashboard Stub</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ProtectedRoute', () => {
  it('redirects to /login when there is no session', async () => {
    renderTestRouter(['/protected'])
    expect(await screen.findByText('Login Page')).toBeInTheDocument()
  })

  it('renders the protected content once the session is validated', async () => {
    const { user, token } = await loginAs('admin')
    useAuthStore.setState({ user, token })

    renderTestRouter(['/protected'])
    expect(await screen.findByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /login and clears the session when the token is invalid', async () => {
    useAuthStore.setState({
      user: { id: 'user-admin', name: 'Ava', email: 'admin@myshop.test', role: 'admin' },
      token: 'not-a-real-token',
    })

    renderTestRouter(['/protected'])
    expect(await screen.findByText('Login Page')).toBeInTheDocument()
    expect(useAuthStore.getState().token).toBeNull()
  })
})

describe('PublicOnlyRoute', () => {
  it('renders the login page when there is no session', async () => {
    renderTestRouter(['/login'])
    expect(await screen.findByText('Login Page')).toBeInTheDocument()
  })

  it('redirects away from /login when already authenticated', async () => {
    const { user, token } = await loginAs('viewer')
    useAuthStore.setState({ user, token })

    renderTestRouter(['/login'])
    expect(await screen.findByText('Dashboard Stub')).toBeInTheDocument()
  })
})
