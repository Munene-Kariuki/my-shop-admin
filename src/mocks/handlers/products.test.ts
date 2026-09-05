import { describe, expect, it } from 'vitest'
import { db } from '@/mocks/db'
import { authHeaders, loginAs } from '@/test/authHelpers'
import type { PaginatedResponse, ProductInputBody } from '@/types/api'
import type { Product } from '@/types/domain'

describe('GET /api/products', () => {
  it('requires authentication', async () => {
    const response = await fetch('/api/products')
    expect(response.status).toBe(401)
  })

  it('paginates with a default page size of 10', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/products', { headers: authHeaders(token) })
    const body = (await response.json()) as PaginatedResponse<Product>

    expect(body.total).toBe(db.products.length)
    expect(body.data.length).toBe(10)
  })

  it('searches by product name', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/products?search=wireless earbuds', {
      headers: authHeaders(token),
    })
    const body = (await response.json()) as PaginatedResponse<Product>
    expect(body.data.every((p) => p.name.toLowerCase().includes('wireless earbuds'))).toBe(true)
    expect(body.total).toBeGreaterThan(0)
  })

  it('searches by SKU', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/products?search=BB-0001', { headers: authHeaders(token) })
    const body = (await response.json()) as PaginatedResponse<Product>
    expect(body.data.some((p) => p.sku === 'BB-0001')).toBe(true)
  })

  it('filters by shop', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/products?shopId=shop-3&pageSize=50', {
      headers: authHeaders(token),
    })
    const body = (await response.json()) as PaginatedResponse<Product>
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data.every((p) => p.shopId === 'shop-3')).toBe(true)
  })

  it('filters by category', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/products?category=Books&pageSize=50', {
      headers: authHeaders(token),
    })
    const body = (await response.json()) as PaginatedResponse<Product>
    expect(body.data.every((p) => p.category === 'Books')).toBe(true)
  })

  it('filters by stock status', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/products?stockStatus=out-of-stock&pageSize=50', {
      headers: authHeaders(token),
    })
    const body = (await response.json()) as PaginatedResponse<Product>
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data.every((p) => p.stock === 0)).toBe(true)
  })

  it('sorts by price descending', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/products?sort=price&sortDir=desc&pageSize=50', {
      headers: authHeaders(token),
    })
    const body = (await response.json()) as PaginatedResponse<Product>
    const prices = body.data.map((p) => p.price)
    expect(prices).toEqual([...prices].sort((a, b) => b - a))
  })
})

describe('GET /api/products/:id', () => {
  it('returns a single product', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/products/product-UT-0001', { headers: authHeaders(token) })
    expect(response.status).toBe(200)
  })

  it('returns 404 for an unknown product', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/products/does-not-exist', { headers: authHeaders(token) })
    expect(response.status).toBe(404)
  })
})

describe('POST /api/products', () => {
  const validInput: ProductInputBody = {
    name: 'Test Widget',
    sku: 'TEST-0001',
    shopId: 'shop-1',
    category: 'Apparel',
    price: 19.99,
    stock: 20,
  }

  it('creates a product as admin', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(validInput),
    })
    expect(response.status).toBe(201)
    const product = (await response.json()) as Product
    expect(product.sku).toBe('TEST-0001')
  })

  it('rejects a duplicate SKU', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ ...validInput, sku: 'UT-0001' }),
    })
    expect(response.status).toBe(400)
  })

  it('rejects an unknown shop', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ ...validInput, shopId: 'does-not-exist' }),
    })
    expect(response.status).toBe(400)
  })

  it('rejects a zero price', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ ...validInput, price: 0 }),
    })
    expect(response.status).toBe(400)
  })

  it('rejects negative stock', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ ...validInput, stock: -1 }),
    })
    expect(response.status).toBe(400)
  })

  it('forbids viewers from creating products', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(validInput),
    })
    expect(response.status).toBe(403)
  })
})

describe('PATCH /api/products/:id', () => {
  it('updates a product as admin', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/products/product-UT-0001', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ price: 45.5 }),
    })
    expect(response.status).toBe(200)
    const product = (await response.json()) as Product
    expect(product.price).toBe(45.5)
  })

  it('allows re-saving the same SKU on the same product', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/products/product-UT-0001', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ sku: 'UT-0001' }),
    })
    expect(response.status).toBe(200)
  })

  it('returns 404 for an unknown product', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/products/does-not-exist', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ price: 10 }),
    })
    expect(response.status).toBe(404)
  })
})

describe('DELETE /api/products/:id', () => {
  it('deletes a product as admin', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/products/product-UT-0001', {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    expect(response.status).toBe(204)

    const getResponse = await fetch('/api/products/product-UT-0001', {
      headers: authHeaders(token),
    })
    expect(getResponse.status).toBe(404)
  })

  it('forbids viewers from deleting products', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/products/product-UT-0001', {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    expect(response.status).toBe(403)
  })
})
