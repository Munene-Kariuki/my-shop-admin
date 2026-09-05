import { http, HttpResponse } from 'msw'
import { AuthError, requireAuth, requireRole } from '@/mocks/auth'
import { db, generateId, persistDb } from '@/mocks/db'
import { delay, paginate, parseListParams, sortItems } from '@/mocks/utils'
import { isValidUrl } from '@/mocks/validation'
import type { ApiErrorBody, PaginatedResponse, ProductInputBody } from '@/types/api'
import type { Product, StockStatus } from '@/types/domain'
import { getStockStatus } from '@/types/domain'

function validateProductInput(
  body: Partial<ProductInputBody>,
  isCreate: boolean,
  excludeId?: string,
): string | null {
  if (isCreate && (!body.name || !body.name.trim())) {
    return 'Product name is required.'
  }
  if (isCreate && (!body.sku || !body.sku.trim())) {
    return 'SKU is required.'
  }
  if (body.sku) {
    const normalized = body.sku.trim().toLowerCase()
    const duplicate = db.products.find(
      (p) => p.sku.toLowerCase() === normalized && p.id !== excludeId,
    )
    if (duplicate) return 'A product with this SKU already exists.'
  }
  if (isCreate && !body.shopId) {
    return 'Shop is required.'
  }
  if (body.shopId && !db.shops.some((s) => s.id === body.shopId)) {
    return 'Selected shop does not exist.'
  }
  if (isCreate && (!body.category || !body.category.trim())) {
    return 'Category is required.'
  }
  if (body.price !== undefined && (typeof body.price !== 'number' || body.price <= 0)) {
    return 'Price must be greater than zero.'
  }
  if (isCreate && body.price === undefined) {
    return 'Price must be greater than zero.'
  }
  if (body.stock !== undefined && (typeof body.stock !== 'number' || body.stock < 0)) {
    return 'Stock level cannot be negative.'
  }
  if (isCreate && body.stock === undefined) {
    return 'Stock level cannot be negative.'
  }
  if (body.imageUrl && !isValidUrl(body.imageUrl)) {
    return 'Product image must be a valid URL.'
  }
  if (body.status && body.status !== 'active' && body.status !== 'inactive') {
    return 'Status must be "active" or "inactive".'
  }
  return null
}

export const productsHandlers = [
  http.get<never, never, PaginatedResponse<Product> | ApiErrorBody>(
    '/api/products',
    async ({ request }) => {
      await delay()

      try {
        requireAuth(request)

        const url = new URL(request.url)
        const { page, pageSize, sort, sortDir, search } = parseListParams(url.searchParams, {
          sort: 'name',
        })
        const shopId = url.searchParams.get('shopId')
        const category = url.searchParams.get('category')
        const status = url.searchParams.get('status')
        const stockStatus = url.searchParams.get('stockStatus') as StockStatus | null

        let products = db.products.slice()
        if (search) {
          const needle = search.toLowerCase()
          products = products.filter(
            (p) => p.name.toLowerCase().includes(needle) || p.sku.toLowerCase().includes(needle),
          )
        }
        if (shopId) products = products.filter((p) => p.shopId === shopId)
        if (category) products = products.filter((p) => p.category === category)
        if (status) products = products.filter((p) => p.status === status)
        if (stockStatus) products = products.filter((p) => getStockStatus(p.stock) === stockStatus)

        products = sortItems(products, sort, sortDir)

        return HttpResponse.json(paginate(products, page, pageSize))
      } catch (error) {
        if (error instanceof AuthError) {
          return HttpResponse.json({ message: error.message }, { status: error.status })
        }
        throw error
      }
    },
  ),

  http.get<{ id: string }, never, Product | ApiErrorBody>(
    '/api/products/:id',
    async ({ request, params }) => {
      await delay()

      try {
        requireAuth(request)

        const product = db.products.find((p) => p.id === params.id)
        if (!product) {
          return HttpResponse.json({ message: 'Product not found.' }, { status: 404 })
        }

        return HttpResponse.json(product)
      } catch (error) {
        if (error instanceof AuthError) {
          return HttpResponse.json({ message: error.message }, { status: error.status })
        }
        throw error
      }
    },
  ),

  http.post<never, ProductInputBody, Product | ApiErrorBody>(
    '/api/products',
    async ({ request }) => {
      await delay(400)

      try {
        const user = requireAuth(request)
        requireRole(user, ['admin'])

        const body = (await request.json()) as Partial<ProductInputBody>
        const validationError = validateProductInput(body, true)
        if (validationError) {
          return HttpResponse.json({ message: validationError }, { status: 400 })
        }

        const now = new Date().toISOString()
        const product: Product = {
          id: generateId('product'),
          name: body.name!.trim(),
          sku: body.sku!.trim(),
          shopId: body.shopId!,
          category: body.category!.trim(),
          price: body.price!,
          stock: body.stock!,
          description: body.description?.trim() ?? '',
          imageUrl: body.imageUrl?.trim() ?? '',
          status: body.status ?? 'active',
          createdAt: now,
          updatedAt: now,
        }
        db.products.push(product)
        persistDb()

        return HttpResponse.json(product, { status: 201 })
      } catch (error) {
        if (error instanceof AuthError) {
          return HttpResponse.json({ message: error.message }, { status: error.status })
        }
        throw error
      }
    },
  ),

  http.patch<{ id: string }, ProductInputBody, Product | ApiErrorBody>(
    '/api/products/:id',
    async ({ request, params }) => {
      await delay(400)

      try {
        const user = requireAuth(request)
        requireRole(user, ['admin'])

        const product = db.products.find((p) => p.id === params.id)
        if (!product) {
          return HttpResponse.json({ message: 'Product not found.' }, { status: 404 })
        }

        const body = (await request.json()) as Partial<ProductInputBody>
        const validationError = validateProductInput(body, false, product.id)
        if (validationError) {
          return HttpResponse.json({ message: validationError }, { status: 400 })
        }

        if (body.name !== undefined) product.name = body.name.trim()
        if (body.sku !== undefined) product.sku = body.sku.trim()
        if (body.shopId !== undefined) product.shopId = body.shopId
        if (body.category !== undefined) product.category = body.category.trim()
        if (body.price !== undefined) product.price = body.price
        if (body.stock !== undefined) product.stock = body.stock
        if (body.description !== undefined) product.description = body.description.trim()
        if (body.imageUrl !== undefined) product.imageUrl = body.imageUrl.trim()
        if (body.status !== undefined) product.status = body.status
        product.updatedAt = new Date().toISOString()
        persistDb()

        return HttpResponse.json(product)
      } catch (error) {
        if (error instanceof AuthError) {
          return HttpResponse.json({ message: error.message }, { status: error.status })
        }
        throw error
      }
    },
  ),

  http.delete<{ id: string }, never, null | ApiErrorBody>(
    '/api/products/:id',
    async ({ request, params }) => {
      await delay(400)

      try {
        const user = requireAuth(request)
        requireRole(user, ['admin'])

        const productIndex = db.products.findIndex((p) => p.id === params.id)
        if (productIndex === -1) {
          return HttpResponse.json({ message: 'Product not found.' }, { status: 404 })
        }

        db.products.splice(productIndex, 1)
        persistDb()

        return new HttpResponse(null, { status: 204 })
      } catch (error) {
        if (error instanceof AuthError) {
          return HttpResponse.json({ message: error.message }, { status: error.status })
        }
        throw error
      }
    },
  ),
]
