import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RoleGate } from '@/components/common/RoleGate'
import { useAuthStore } from '@/features/auth/store'
import type { AuthenticatedUser } from '@/types/domain'

const adminUser: AuthenticatedUser = {
  id: 'user-admin',
  name: 'Ava Administrator',
  email: 'admin@myshop.test',
  role: 'admin',
}

const viewerUser: AuthenticatedUser = {
  id: 'user-viewer',
  name: 'Victor Viewer',
  email: 'viewer@myshop.test',
  role: 'viewer',
}

describe('RoleGate', () => {
  it('renders children when the current user has an allowed role', () => {
    useAuthStore.setState({ user: adminUser, token: 'x' })
    render(
      <RoleGate allow={['admin']}>
        <button>Delete</button>
      </RoleGate>,
    )
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('renders nothing when the current user lacks an allowed role', () => {
    useAuthStore.setState({ user: viewerUser, token: 'x' })
    render(
      <RoleGate allow={['admin']}>
        <button>Delete</button>
      </RoleGate>,
    )
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('renders the fallback when provided and the role check fails', () => {
    useAuthStore.setState({ user: viewerUser, token: 'x' })
    render(
      <RoleGate allow={['admin']} fallback={<span>Not allowed</span>}>
        <button>Delete</button>
      </RoleGate>,
    )
    expect(screen.getByText('Not allowed')).toBeInTheDocument()
  })

  it('renders nothing when there is no signed-in user', () => {
    useAuthStore.setState({ user: null, token: null })
    render(
      <RoleGate allow={['admin', 'viewer']}>
        <button>Delete</button>
      </RoleGate>,
    )
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })
})
