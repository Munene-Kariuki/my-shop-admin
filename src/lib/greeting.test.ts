import { describe, expect, it } from 'vitest'
import { getGreeting } from '@/lib/greeting'

describe('getGreeting', () => {
  it('returns a morning greeting before noon', () => {
    expect(getGreeting(new Date('2026-01-01T09:00:00'))).toBe('Good morning')
  })

  it('returns an afternoon greeting from noon until 6pm', () => {
    expect(getGreeting(new Date('2026-01-01T13:00:00'))).toBe('Good afternoon')
  })

  it('returns an evening greeting from 6pm onward', () => {
    expect(getGreeting(new Date('2026-01-01T20:00:00'))).toBe('Good evening')
  })
})
