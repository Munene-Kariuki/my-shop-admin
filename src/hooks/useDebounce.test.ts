import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useDebounce } from '@/hooks/useDebounce'

describe('useDebounce', () => {
  it('only updates after the delay has elapsed without further changes', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    })

    expect(result.current).toBe('a')

    rerender({ value: 'ab' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('a') // not yet

    rerender({ value: 'abc' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('a') // still debounced by the latest change

    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('abc')

    vi.useRealTimers()
  })
})
