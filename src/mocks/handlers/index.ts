import type { HttpHandler } from 'msw'
import { authHandlers } from '@/mocks/handlers/auth'
import { inventoryHandlers } from '@/mocks/handlers/inventory'
import { productsHandlers } from '@/mocks/handlers/products'
import { shopsHandlers } from '@/mocks/handlers/shops'

export const handlers: HttpHandler[] = [
  ...authHandlers,
  ...inventoryHandlers,
  ...shopsHandlers,
  ...productsHandlers,
]
