import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { MobileNav } from '@/app/layout/MobileNav'
import { Sidebar } from '@/app/layout/Sidebar'

describe('Sidebar', () => {
  it('marks the active nav link matching the current route', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /shops/i })).not.toHaveAttribute('aria-current')
  })

  it('links to all three top-level sections', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: /shops/i })).toHaveAttribute('href', '/shops')
    expect(screen.getByRole('link', { name: /products/i })).toHaveAttribute('href', '/products')
  })
})

describe('MobileNav', () => {
  it('opens the nav drawer and closes it after selecting a link', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <MobileNav />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: /shops/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /open navigation menu/i }))
    const shopsLink = await screen.findByRole('link', { name: /shops/i })
    expect(shopsLink).toBeInTheDocument()

    await user.click(shopsLink)
    expect(screen.queryByRole('link', { name: /shops/i })).not.toBeInTheDocument()
  })
})
