import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StockStatusBadge } from '@/components/common/StockStatusBadge'

describe('StockStatusBadge', () => {
  it('labels zero stock as Out of Stock', () => {
    render(<StockStatusBadge stock={0} />)
    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
  })

  it('labels 1-5 units as Low Stock', () => {
    render(<StockStatusBadge stock={3} />)
    expect(screen.getByText('Low Stock')).toBeInTheDocument()
  })

  it('labels more than 5 units as In Stock', () => {
    render(<StockStatusBadge stock={20} />)
    expect(screen.getByText('In Stock')).toBeInTheDocument()
  })
})
