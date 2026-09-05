import { describe, expect, it } from 'vitest'
import { db, generateId, resetDb } from '@/mocks/db'
import { getStockStatus } from '@/types/domain'

describe('mock database seed data', () => {
  it('seeds shops and products with realistic volume for pagination/filtering', () => {
    expect(db.shops.length).toBeGreaterThanOrEqual(8)
    expect(db.products.length).toBeGreaterThan(50)
  })

  it('leaves at least one shop with no products (empty state coverage)', () => {
    const shopIdsWithProducts = new Set(db.products.map((p) => p.shopId))
    const emptyShop = db.shops.find((s) => !shopIdsWithProducts.has(s.id))
    expect(emptyShop).toBeDefined()
  })

  it('includes both low-stock and out-of-stock products for every stocked shop', () => {
    const shopIdsWithProducts = new Set(db.products.map((p) => p.shopId))
    for (const shopId of shopIdsWithProducts) {
      const statuses = db.products
        .filter((p) => p.shopId === shopId)
        .map((p) => getStockStatus(p.stock))
      expect(statuses).toContain('low-stock')
      expect(statuses).toContain('out-of-stock')
    }
  })

  it('generateId produces unique, prefixed ids', () => {
    const a = generateId('product')
    const b = generateId('product')
    expect(a).not.toBe(b)
    expect(a.startsWith('product-')).toBe(true)
  })

  it('resetDb restores the original seed counts after a mutation', () => {
    const originalShopCount = db.shops.length
    db.shops.push({
      id: 'temp-shop',
      name: 'Temp',
      description: '',
      logoUrl: '',
      contactEmail: 'a@b.com',
      status: 'active',
      createdAt: new Date().toISOString(),
    })
    expect(db.shops.length).toBe(originalShopCount + 1)

    resetDb()
    expect(db.shops.length).toBe(originalShopCount)
  })
})
