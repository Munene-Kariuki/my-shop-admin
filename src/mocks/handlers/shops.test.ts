import { describe, expect, it } from 'vitest'
import { db } from '@/mocks/db'
import { authHeaders, loginAs } from '@/test/authHelpers'
import type { ApiErrorBody, PaginatedResponse, ShopInputBody } from '@/types/api'
import type { ShopWithStats } from '@/types/domain'

describe('GET /api/shops', () => {
  it('requires authentication', async () => {
    const response = await fetch('/api/shops')
    expect(response.status).toBe(401)
  })

  it('lists all seeded shops with computed stats', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/shops?pageSize=50', { headers: authHeaders(token) })

    expect(response.status).toBe(200)
    const body = (await response.json()) as PaginatedResponse<ShopWithStats>
    expect(body.total).toBe(db.shops.length)

    const urbanThreads = body.data.find((s) => s.id === 'shop-1')!
    expect(urbanThreads.productCount).toBeGreaterThan(0)
    expect(urbanThreads.totalInventoryValue).toBeGreaterThan(0)
  })

  it('filters by search term', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/shops?search=kitchen', { headers: authHeaders(token) })
    const body = (await response.json()) as PaginatedResponse<ShopWithStats>

    expect(body.data.length).toBe(1)
    expect(body.data[0].name).toMatch(/kitchen/i)
  })

  it('sorts by name descending', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/shops?sort=name&sortDir=desc&pageSize=50', {
      headers: authHeaders(token),
    })
    const body = (await response.json()) as PaginatedResponse<ShopWithStats>
    const names = body.data.map((s) => s.name)
    expect(names).toEqual([...names].sort().reverse())
  })
})

describe('GET /api/shops/:id', () => {
  it('returns a single shop with stats', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/shops/shop-2', { headers: authHeaders(token) })
    expect(response.status).toBe(200)
    const shop = (await response.json()) as ShopWithStats
    expect(shop.name).toBe('Kitchen & Co.')
  })

  it('returns 404 for an unknown shop', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/shops/does-not-exist', { headers: authHeaders(token) })
    expect(response.status).toBe(404)
  })
})

describe('POST /api/shops', () => {
  const validInput: ShopInputBody = {
    name: 'New Test Shop',
    description: 'A shop created in a test',
    contactEmail: 'shop@example.com',
    status: 'active',
  }

  it('creates a shop as admin', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/shops', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(validInput),
    })
    expect(response.status).toBe(201)
    const shop = (await response.json()) as ShopWithStats
    expect(shop.name).toBe('New Test Shop')
    expect(shop.productCount).toBe(0)
  })

  it('rejects a missing name', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/shops', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ ...validInput, name: '' }),
    })
    expect(response.status).toBe(400)
  })

  it('rejects an invalid contact email', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/shops', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ ...validInput, contactEmail: 'not-an-email' }),
    })
    expect(response.status).toBe(400)
  })

  it('forbids viewers from creating shops', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/shops', {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(validInput),
    })
    expect(response.status).toBe(403)
  })
})

describe('PATCH /api/shops/:id', () => {
  it('updates shop fields as admin', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/shops/shop-2', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'Kitchen & Co. Updated', status: 'inactive' }),
    })
    expect(response.status).toBe(200)
    const shop = (await response.json()) as ShopWithStats
    expect(shop.name).toBe('Kitchen & Co. Updated')
    expect(shop.status).toBe('inactive')
  })

  it('returns 404 for an unknown shop', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/shops/does-not-exist', {
      method: 'PATCH',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'x' }),
    })
    expect(response.status).toBe(404)
  })
})

describe('DELETE /api/shops/:id', () => {
  it('blocks deletion when the shop has products', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/shops/shop-1', {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    expect(response.status).toBe(409)
    const body = (await response.json()) as ApiErrorBody
    expect(body.message).toMatch(/products/i)
  })

  it('deletes a shop with no products', async () => {
    const { token } = await loginAs('admin')
    const response = await fetch('/api/shops/shop-9', {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    expect(response.status).toBe(204)

    const getResponse = await fetch('/api/shops/shop-9', { headers: authHeaders(token) })
    expect(getResponse.status).toBe(404)
  })

  it('forbids viewers from deleting shops', async () => {
    const { token } = await loginAs('viewer')
    const response = await fetch('/api/shops/shop-9', {
      method: 'DELETE',
      headers: authHeaders(token),
    })
    expect(response.status).toBe(403)
  })
})
