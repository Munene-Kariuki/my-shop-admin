import type { Product, Shop, ShopWithStats } from '@/types/domain'

/** Derived shop metrics, computed on demand from the current product list (never stored). */
export function computeShopStats(shopId: string, products: Product[]) {
  const shopProducts = products.filter((p) => p.shopId === shopId)
  const productCount = shopProducts.length
  const totalStock = shopProducts.reduce((sum, p) => sum + p.stock, 0)
  const totalInventoryValue = shopProducts.reduce((sum, p) => sum + p.price * p.stock, 0)
  return { productCount, totalStock, totalInventoryValue }
}

export function withShopStats(shop: Shop, products: Product[]): ShopWithStats {
  return { ...shop, ...computeShopStats(shop.id, products) }
}

export function getShopsWithStats(shops: Shop[], products: Product[]): ShopWithStats[] {
  return shops.map((shop) => withShopStats(shop, products))
}
