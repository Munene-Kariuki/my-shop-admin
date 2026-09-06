import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NotFoundPage } from '@/features/NotFoundPage'

describe('NotFoundPage', () => {
  it('shows a not-found message with a link back home', () => {
    render(
      <MemoryRouter initialEntries={['/this-route-does-not-exist']}>
        <NotFoundPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/page not found/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to home/i })).toHaveAttribute('href', '/')
  })
})
