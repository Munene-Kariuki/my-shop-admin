import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Breadcrumbs } from '@/app/layout/Breadcrumbs'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Breadcrumbs />
    </MemoryRouter>,
  )
}

describe('Breadcrumbs', () => {
  it('shows a single current-page crumb for a top-level route', () => {
    renderAt('/dashboard')
    const current = screen.getByText('Dashboard')
    expect(current).toHaveAttribute('aria-current', 'page')
  })

  it('shows a link trail followed by the current page for a nested route', () => {
    renderAt('/shops/new')

    const shopsLink = screen.getByRole('link', { name: 'Shops' })
    expect(shopsLink).toHaveAttribute('href', '/shops')

    const current = screen.getByText('New')
    expect(current).toHaveAttribute('aria-current', 'page')
  })

  it('falls back to "Details" for an unrecognized trailing segment (e.g. an id)', () => {
    renderAt('/shops/shop-123')
    expect(screen.getByText('Details')).toHaveAttribute('aria-current', 'page')
  })
})
