export type Role = 'admin' | 'viewer'

export interface User {
  id: string
  name: string
  email: string
  password: string
  role: Role
}

export type AuthenticatedUser = Omit<User, 'password'>

export type ShopStatus = 'active' | 'inactive'

export interface Shop {
  id: string
  name: string
  description: string
  logoUrl: string
  contactEmail: string
  status: ShopStatus
  createdAt: string
}

export interface ShopStats {
  productCount: number
  totalStock: number
  totalInventoryValue: number
}

export type ShopWithStats = Shop & ShopStats

export type ProductStatus = 'active' | 'inactive'

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock'

export interface Product {
  id: string
  name: string
  sku: string
  shopId: string
  category: string
  price: number
  stock: number
  description: string
  imageUrl: string
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export type AdjustmentType = 'increase' | 'decrease'

export interface InventoryAdjustment {
  id: string
  productId: string
  type: AdjustmentType
  amount: number
  previousStock: number
  newStock: number
  reason: string
  date: string
  userId: string
  userName: string
}

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return 'out-of-stock'
  if (stock <= 5) return 'low-stock'
  return 'in-stock'
}
