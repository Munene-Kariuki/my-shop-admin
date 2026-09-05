import { http, HttpResponse } from 'msw'
import { AuthError, requireAuth, requireRole } from '@/mocks/auth'
import { db, generateId, persistDb } from '@/mocks/db'
import { delay } from '@/mocks/utils'
import type {
  ApiErrorBody,
  InventoryAdjustmentRequestBody,
  InventoryAdjustmentResponseBody,
} from '@/types/api'
import type { InventoryAdjustment } from '@/types/domain'

export const inventoryHandlers = [
  http.post<{ id: string }, InventoryAdjustmentRequestBody, InventoryAdjustmentResponseBody | ApiErrorBody>(
    '/api/products/:id/inventory-adjustments',
    async ({ request, params }) => {
      await delay(400)

      try {
        const user = requireAuth(request)
        requireRole(user, ['admin'])

        const product = db.products.find((p) => p.id === params.id)
        if (!product) {
          return HttpResponse.json({ message: 'Product not found.' }, { status: 404 })
        }

        const body = (await request.json()) as Partial<InventoryAdjustmentRequestBody>
        const { type, amount, reason } = body

        if (type !== 'increase' && type !== 'decrease') {
          return HttpResponse.json(
            { message: 'Adjustment type must be "increase" or "decrease".' },
            { status: 400 },
          )
        }
        if (typeof amount !== 'number' || amount <= 0) {
          return HttpResponse.json(
            { message: 'Adjustment quantity must be greater than zero.' },
            { status: 400 },
          )
        }
        if (!reason || !reason.trim()) {
          return HttpResponse.json(
            { message: 'Please provide a reason for this adjustment.' },
            { status: 400 },
          )
        }

        const previousStock = product.stock
        const newStock = type === 'increase' ? previousStock + amount : previousStock - amount

        if (newStock < 0) {
          return HttpResponse.json(
            { message: 'This adjustment would result in negative stock.' },
            { status: 400 },
          )
        }

        product.stock = newStock
        product.updatedAt = new Date().toISOString()

        const adjustment: InventoryAdjustment = {
          id: generateId('adjustment'),
          productId: product.id,
          type,
          amount,
          previousStock,
          newStock,
          reason: reason.trim(),
          date: new Date().toISOString(),
          userId: user.id,
          userName: user.name,
        }
        db.inventoryAdjustments.push(adjustment)
        persistDb()

        return HttpResponse.json({ product, adjustment })
      } catch (error) {
        if (error instanceof AuthError) {
          return HttpResponse.json({ message: error.message }, { status: error.status })
        }
        throw error
      }
    },
  ),

  http.get<{ id: string }, never, InventoryAdjustment[] | ApiErrorBody>(
    '/api/products/:id/inventory-adjustments',
    async ({ request, params }) => {
      await delay(200)

      try {
        requireAuth(request)

        const history = db.inventoryAdjustments
          .filter((a) => a.productId === params.id)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        return HttpResponse.json(history)
      } catch (error) {
        if (error instanceof AuthError) {
          return HttpResponse.json({ message: error.message }, { status: error.status })
        }
        throw error
      }
    },
  ),
]
