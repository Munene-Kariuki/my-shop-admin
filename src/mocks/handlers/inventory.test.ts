import { describe, expect, it } from 'vitest'
import { db } from '@/mocks/db'
import { authHeaders, loginAs } from '@/test/authHelpers'
import type { ApiErrorBody, InventoryAdjustmentResponseBody } from '@/types/api'
import type { InventoryAdjustment } from '@/types/domain'

const PRODUCT_ID = 'product-UT-0001'

async function adjustStock(
  token: string,
  productId: string,
  body: Record<string, unknown>,
) {
  return fetch(`/api/products/${productId}/inventory-adjustments`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  })
}

describe('POST /api/products/:id/inventory-adjustments', () => {
  it('increases stock and records adjustment history', async () => {
    const { token } = await loginAs('admin')
    const before = db.products.find((p) => p.id === PRODUCT_ID)!.stock

    const response = await adjustStock(token, PRODUCT_ID, {
      type: 'increase',
      amount: 10,
      reason: 'New shipment received',
    })

    expect(response.status).toBe(200)
    const body = (await response.json()) as InventoryAdjustmentResponseBody
    expect(body.product.stock).toBe(before + 10)
    expect(body.adjustment.previousStock).toBe(before)
    expect(body.adjustment.newStock).toBe(before + 10)
    expect(body.adjustment.reason).toBe('New shipment received')
  })

  it('rejects an adjustment that would make stock negative', async () => {
    const { token } = await loginAs('admin')
    const response = await adjustStock(token, PRODUCT_ID, {
      type: 'decrease',
      amount: 999999,
      reason: 'Too many',
    })

    expect(response.status).toBe(400)
    const body = (await response.json()) as ApiErrorBody
    expect(body.message).toMatch(/negative/i)
  })

  it('rejects a zero or negative quantity', async () => {
    const { token } = await loginAs('admin')
    const response = await adjustStock(token, PRODUCT_ID, {
      type: 'increase',
      amount: 0,
      reason: 'No-op',
    })

    expect(response.status).toBe(400)
  })

  it('rejects a missing reason', async () => {
    const { token } = await loginAs('admin')
    const response = await adjustStock(token, PRODUCT_ID, { type: 'increase', amount: 5, reason: '' })
    expect(response.status).toBe(400)
  })

  it('forbids viewers from adjusting stock', async () => {
    const { token } = await loginAs('viewer')
    const response = await adjustStock(token, PRODUCT_ID, {
      type: 'increase',
      amount: 5,
      reason: 'Should be blocked',
    })
    expect(response.status).toBe(403)
  })

  it('returns 404 for an unknown product', async () => {
    const { token } = await loginAs('admin')
    const response = await adjustStock(token, 'does-not-exist', {
      type: 'increase',
      amount: 5,
      reason: 'test',
    })
    expect(response.status).toBe(404)
  })
})

describe('GET /api/products/:id/inventory-adjustments', () => {
  it('requires authentication', async () => {
    const response = await fetch(`/api/products/${PRODUCT_ID}/inventory-adjustments`)
    expect(response.status).toBe(401)
  })

  it('returns adjustment history newest first', async () => {
    const { token } = await loginAs('admin')
    await adjustStock(token, PRODUCT_ID, { type: 'increase', amount: 3, reason: 'first' })
    await adjustStock(token, PRODUCT_ID, { type: 'decrease', amount: 1, reason: 'second' })

    const response = await fetch(`/api/products/${PRODUCT_ID}/inventory-adjustments`, {
      headers: authHeaders(token),
    })
    expect(response.status).toBe(200)
    const history = (await response.json()) as InventoryAdjustment[]
    expect(history.length).toBeGreaterThanOrEqual(2)
    expect(history[0].reason).toBe('second')
  })
})
