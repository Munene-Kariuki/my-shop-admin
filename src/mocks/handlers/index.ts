import type { HttpHandler } from 'msw'
import { authHandlers } from '@/mocks/handlers/auth'
import { inventoryHandlers } from '@/mocks/handlers/inventory'

// Shops and products handlers are added in later steps.
export const handlers: HttpHandler[] = [...authHandlers, ...inventoryHandlers]
