import type { StockStatus } from '@/types/domain'

// The mock API has no "list categories" endpoint — this mirrors the fixed
// catalog used to seed products (see src/mocks/seed/products.ts).
export const PRODUCT_CATEGORIES = [
  'Apparel',
  'Home & Kitchen',
  'Electronics',
  'Beauty',
  'Outdoors',
  'Toys',
  'Books',
  'Grocery',
] as const

export const STOCK_STATUS_OPTIONS: Array<{ value: StockStatus; label: string }> = [
  { value: 'in-stock', label: 'In Stock' },
  { value: 'low-stock', label: 'Low Stock' },
  { value: 'out-of-stock', label: 'Out of Stock' },
]
