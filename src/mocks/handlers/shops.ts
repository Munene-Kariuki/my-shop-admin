import { http, HttpResponse } from 'msw'
import { AuthError, requireAuth, requireRole } from '@/mocks/auth'
import { getShopsWithStats, withShopStats } from '@/mocks/computed'
import { db, generateId, persistDb } from '@/mocks/db'
import { delay, paginate, parseListParams, sortItems } from '@/mocks/utils'
import { isValidEmail, isValidUrl } from '@/mocks/validation'
import type { ApiErrorBody, PaginatedResponse, ShopInputBody } from '@/types/api'
import type { Shop, ShopWithStats } from '@/types/domain'

function validateShopInput(body: Partial<ShopInputBody>, isCreate: boolean): string | null {
  if (isCreate && (!body.name || !body.name.trim())) {
    return 'Shop name is required.'
  }
  if (body.contactEmail && !isValidEmail(body.contactEmail)) {
    return 'Contact email must be a valid email address.'
  }
  if (body.logoUrl && !isValidUrl(body.logoUrl)) {
    return 'Logo URL must be a valid URL.'
  }
  if (body.status && body.status !== 'active' && body.status !== 'inactive') {
    return 'Status must be "active" or "inactive".'
  }
  return null
}

export const shopsHandlers = [
  http.get<never, never, PaginatedResponse<ShopWithStats> | ApiErrorBody>(
    '/api/shops',
    async ({ request }) => {
      await delay()

      try {
        requireAuth(request)

        const url = new URL(request.url)
        const { page, pageSize, sort, sortDir, search } = parseListParams(url.searchParams, {
          sort: 'name',
        })

        let shops = getShopsWithStats(db.shops, db.products)
        if (search) {
          const needle = search.toLowerCase()
          shops = shops.filter((s) => s.name.toLowerCase().includes(needle))
        }
        shops = sortItems(shops, sort, sortDir)

        return HttpResponse.json(paginate(shops, page, pageSize))
      } catch (error) {
        if (error instanceof AuthError) {
          return HttpResponse.json({ message: error.message }, { status: error.status })
        }
        throw error
      }
    },
  ),

  http.get<{ id: string }, never, ShopWithStats | ApiErrorBody>(
    '/api/shops/:id',
    async ({ request, params }) => {
      await delay()

      try {
        requireAuth(request)

        const shop = db.shops.find((s) => s.id === params.id)
        if (!shop) {
          return HttpResponse.json({ message: 'Shop not found.' }, { status: 404 })
        }

        return HttpResponse.json(withShopStats(shop, db.products))
      } catch (error) {
        if (error instanceof AuthError) {
          return HttpResponse.json({ message: error.message }, { status: error.status })
        }
        throw error
      }
    },
  ),

  http.post<never, ShopInputBody, ShopWithStats | ApiErrorBody>(
    '/api/shops',
    async ({ request }) => {
      await delay(400)

      try {
        const user = requireAuth(request)
        requireRole(user, ['admin'])

        const body = (await request.json()) as Partial<ShopInputBody>
        const validationError = validateShopInput(body, true)
        if (validationError) {
          return HttpResponse.json({ message: validationError }, { status: 400 })
        }

        const shop: Shop = {
          id: generateId('shop'),
          name: body.name!.trim(),
          description: body.description?.trim() ?? '',
          logoUrl: body.logoUrl?.trim() ?? '',
          contactEmail: body.contactEmail?.trim() ?? '',
          status: body.status ?? 'active',
          createdAt: new Date().toISOString(),
        }
        db.shops.push(shop)
        persistDb()

        return HttpResponse.json(withShopStats(shop, db.products), { status: 201 })
      } catch (error) {
        if (error instanceof AuthError) {
          return HttpResponse.json({ message: error.message }, { status: error.status })
        }
        throw error
      }
    },
  ),

  http.patch<{ id: string }, ShopInputBody, ShopWithStats | ApiErrorBody>(
    '/api/shops/:id',
    async ({ request, params }) => {
      await delay(400)

      try {
        const user = requireAuth(request)
        requireRole(user, ['admin'])

        const shop = db.shops.find((s) => s.id === params.id)
        if (!shop) {
          return HttpResponse.json({ message: 'Shop not found.' }, { status: 404 })
        }

        const body = (await request.json()) as Partial<ShopInputBody>
        const validationError = validateShopInput(body, false)
        if (validationError) {
          return HttpResponse.json({ message: validationError }, { status: 400 })
        }

        if (body.name !== undefined) shop.name = body.name.trim()
        if (body.description !== undefined) shop.description = body.description.trim()
        if (body.logoUrl !== undefined) shop.logoUrl = body.logoUrl.trim()
        if (body.contactEmail !== undefined) shop.contactEmail = body.contactEmail.trim()
        if (body.status !== undefined) shop.status = body.status
        persistDb()

        return HttpResponse.json(withShopStats(shop, db.products))
      } catch (error) {
        if (error instanceof AuthError) {
          return HttpResponse.json({ message: error.message }, { status: error.status })
        }
        throw error
      }
    },
  ),

  http.delete<{ id: string }, never, null | ApiErrorBody>('/api/shops/:id', async ({ request, params }) => {
    await delay(400)

    try {
      const user = requireAuth(request)
      requireRole(user, ['admin'])

      const shopIndex = db.shops.findIndex((s) => s.id === params.id)
      if (shopIndex === -1) {
        return HttpResponse.json({ message: 'Shop not found.' }, { status: 404 })
      }

      const hasProducts = db.products.some((p) => p.shopId === params.id)
      if (hasProducts) {
        return HttpResponse.json(
          { message: 'This shop still has products assigned to it and cannot be deleted.' },
          { status: 409 },
        )
      }

      db.shops.splice(shopIndex, 1)
      persistDb()

      return new HttpResponse(null, { status: 204 })
    } catch (error) {
      if (error instanceof AuthError) {
        return HttpResponse.json({ message: error.message }, { status: error.status })
      }
      throw error
    }
  }),
]
