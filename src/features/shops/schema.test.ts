import { describe, expect, it } from 'vitest'
import { shopSchema } from '@/features/shops/schema'

const validInput = {
  name: 'Urban Threads',
  description: 'Streetwear',
  logoUrl: 'https://example.com/logo.png',
  contactEmail: 'hello@example.com',
  status: 'active' as const,
}

describe('shopSchema', () => {
  it('accepts a fully valid input', () => {
    expect(shopSchema.safeParse(validInput).success).toBe(true)
  })

  it('accepts empty optional fields', () => {
    const result = shopSchema.safeParse({ ...validInput, logoUrl: '', contactEmail: '', description: '' })
    expect(result.success).toBe(true)
  })

  it('rejects a missing shop name', () => {
    const result = shopSchema.safeParse({ ...validInput, name: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/shop name is required/i)
    }
  })

  it('rejects an invalid logo URL', () => {
    const result = shopSchema.safeParse({ ...validInput, logoUrl: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('rejects an invalid contact email', () => {
    const result = shopSchema.safeParse({ ...validInput, contactEmail: 'not-an-email' })
    expect(result.success).toBe(false)
  })
})
