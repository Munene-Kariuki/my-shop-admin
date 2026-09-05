import type { InventoryAdjustment, Product, Shop, User } from '@/types/domain'
import { seedProducts } from '@/mocks/seed/products'
import { seedShops } from '@/mocks/seed/shops'
import { seedUsers } from '@/mocks/seed/users'

const STORAGE_KEY = 'my-shop-admin:db:v1'

interface Database {
  users: User[]
  shops: Shop[]
  products: Product[]
  inventoryAdjustments: InventoryAdjustment[]
}

function createInitialDatabase(): Database {
  return {
    users: structuredClone(seedUsers),
    shops: structuredClone(seedShops),
    products: structuredClone(seedProducts),
    inventoryAdjustments: [],
  }
}

function loadDatabase(): Database {
  if (typeof localStorage === 'undefined') {
    return createInitialDatabase()
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialDatabase()

    const parsed = JSON.parse(raw) as Partial<Database>
    if (!parsed.users || !parsed.shops || !parsed.products) {
      return createInitialDatabase()
    }

    return {
      users: parsed.users,
      shops: parsed.shops,
      products: parsed.products,
      inventoryAdjustments: parsed.inventoryAdjustments ?? [],
    }
  } catch {
    return createInitialDatabase()
  }
}

export const db: Database = loadDatabase()

/** Call after every mutation so state survives reloads. */
export function persistDb(): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Storage full or unavailable (e.g. private browsing) — data still
    // works for the rest of the session, it just won't survive a reload.
  }
}

/** Wipes persisted state and reseeds — used by tests and available for a manual reset. */
export function resetDb(): void {
  const fresh = createInitialDatabase()
  db.users = fresh.users
  db.shops = fresh.shops
  db.products = fresh.products
  db.inventoryAdjustments = fresh.inventoryAdjustments
  persistDb()
}

let idCounter = 0
export function generateId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now()}-${idCounter}`
}
