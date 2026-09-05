/** Centralized query key factory so invalidation targets stay consistent across features. */
export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
  },
  shops: {
    all: ['shops'] as const,
    list: (params: unknown) => ['shops', 'list', params] as const,
    detail: (id: string) => ['shops', 'detail', id] as const,
  },
  products: {
    all: ['products'] as const,
    list: (params: unknown) => ['products', 'list', params] as const,
    detail: (id: string) => ['products', 'detail', id] as const,
    inventoryHistory: (id: string) => ['products', 'detail', id, 'inventory-history'] as const,
  },
}
