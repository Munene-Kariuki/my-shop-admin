import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useUrlState } from '@/hooks/useUrlState'

const DEFAULTS = { search: '', sort: 'name', page: '1' }

function Harness() {
  const [state, setState] = useUrlState(DEFAULTS)
  const location = useLocation()

  return (
    <div>
      <p data-testid="state">{JSON.stringify(state)}</p>
      <p data-testid="search">{location.search}</p>
      <button onClick={() => setState({ search: 'kitchen', page: '1' })}>Set search</button>
      <button onClick={() => setState({ sort: 'name', page: '2' })}>Reset sort, page 2</button>
    </div>
  )
}

function renderHarness(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Harness />
    </MemoryRouter>,
  )
}

describe('useUrlState', () => {
  it('returns defaults when no query params are present', () => {
    renderHarness('/shops')
    expect(screen.getByTestId('state')).toHaveTextContent(JSON.stringify(DEFAULTS))
  })

  it('reads initial state from the URL', () => {
    renderHarness('/shops?search=kitchen&page=3')
    expect(screen.getByTestId('state')).toHaveTextContent(
      JSON.stringify({ ...DEFAULTS, search: 'kitchen', page: '3' }),
    )
  })

  it('writes changes to the URL', async () => {
    const user = userEvent.setup()
    renderHarness('/shops')

    await user.click(screen.getByText('Set search'))
    expect(screen.getByTestId('search')).toHaveTextContent('?search=kitchen')
  })

  it('removes a param from the URL when it is set back to its default value', async () => {
    const user = userEvent.setup()
    renderHarness('/shops?sort=price&page=2')

    await user.click(screen.getByText('Reset sort, page 2'))
    // sort=name is the default, so it drops out of the URL; page=2 stays explicit.
    expect(screen.getByTestId('search')).toHaveTextContent('?page=2')
  })
})
