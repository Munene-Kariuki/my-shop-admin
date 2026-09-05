import type {
  AdjustmentType,
  AuthenticatedUser,
  InventoryAdjustment,
  Product,
  ShopStatus,
} from '@/types/domain'

export interface ApiErrorBody {
  message: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface LoginRequestBody {
  email: string
  password: string
}

export interface LoginResponseBody {
  user: AuthenticatedUser
  token: string
  expiresAt: string
}

export interface SessionResponseBody {
  user: AuthenticatedUser
}

export interface InventoryAdjustmentRequestBody {
  type: AdjustmentType
  amount: number
  reason: string
}

export interface InventoryAdjustmentResponseBody {
  product: Product
  adjustment: InventoryAdjustment
}

export interface ShopInputBody {
  name: string
  description?: string
  logoUrl?: string
  contactEmail?: string
  status?: ShopStatus
}
