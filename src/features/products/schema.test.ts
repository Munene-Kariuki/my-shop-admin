import { describe, expect, it } from 'vitest'
import { productSchema } from '@/features/products/schema'

const validInput = {
  name: 'Wireless Earbuds',
  sku: 'BB-0001',
  shopId: 'shop-3',
  category: 'Electronics',
  price: 49.99,
  stock: 20,
  description: 'Noise-isolating wireless earbuds.',
  imageUrl: 'https://example.com/earbuds.png',
  status: 'active' as const,
}

describe('productSchema', () => {
  it('accepts a fully valid input', () => {
    expect(productSchema.safeParse(validInput).success).toBe(true)
  })

  it('accepts an empty description and image URL', () => {
    const result = productSchema.safeParse({ ...validInput, description: '', imageUrl: '' })
    expect(result.success).toBe(true)
  })

  it('rejects a missing name', () => {
    expect(productSchema.safeParse({ ...validInput, name: '' }).success).toBe(false)
  })

  it('rejects a missing SKU', () => {
    expect(productSchema.safeParse({ ...validInput, sku: '' }).success).toBe(false)
  })

  it('rejects a missing shop', () => {
    expect(productSchema.safeParse({ ...validInput, shopId: '' }).success).toBe(false)
  })

  it('rejects a missing category', () => {
    expect(productSchema.safeParse({ ...validInput, category: '' }).success).toBe(false)
  })

  it('rejects a price of zero or less', () => {
    expect(productSchema.safeParse({ ...validInput, price: 0 }).success).toBe(false)
    expect(productSchema.safeParse({ ...validInput, price: -5 }).success).toBe(false)
  })

  it('rejects negative stock', () => {
    expect(productSchema.safeParse({ ...validInput, stock: -1 }).success).toBe(false)
  })

  it('rejects a non-integer stock level', () => {
    expect(productSchema.safeParse({ ...validInput, stock: 1.5 }).success).toBe(false)
  })

  it('rejects an invalid image URL', () => {
    expect(productSchema.safeParse({ ...validInput, imageUrl: 'not-a-url' }).success).toBe(false)
  })
})
