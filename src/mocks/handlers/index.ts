import type { HttpHandler } from 'msw'
import { authHandlers } from '@/mocks/handlers/auth'
import { inventoryHandlers } from '@/mocks/handlers/inventory'
import { shopsHandlers } from '@/mocks/handlers/shops'

// Products handlers are added in a later step.
export const handlers: HttpHandler[] = [...authHandlers, ...inventoryHandlers, ...shopsHandlers]
