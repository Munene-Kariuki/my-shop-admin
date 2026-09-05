import { DollarSign, Layers, Package, PackagePlus, Pencil } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { RoleGate } from '@/components/common/RoleGate'
import { StatCard } from '@/components/common/StatCard'
import { StockStatusBadge } from '@/components/common/StockStatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { InventoryHistoryTable } from '@/features/products/components/InventoryHistoryTable'
import { useInventoryHistory, useProduct } from '@/features/products/hooks'
import { useShop } from '@/features/shops/hooks'
import { ApiError } from '@/lib/api/client'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'

export function ProductDetailsPage() {
  const { productId } = useParams<{ productId: string }>()
  const productQuery = useProduct(productId ?? '')
  const shopQuery = useShop(productQuery.data?.shopId ?? '')
  const historyQuery = useInventoryHistory(productId ?? '')

  if (productQuery.isPending || (productQuery.isSuccess && shopQuery.isPending)) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (productQuery.isError) {
    const notFound = productQuery.error instanceof ApiError && productQuery.error.status === 404
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Product Details</h1>
        {notFound ? (
          <EmptyState
            title="Product not found"
            message="This product may have been deleted, or the link is incorrect."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/products">Back to Products</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState message={productQuery.error.message} onRetry={() => productQuery.refetch()} />
        )}
      </div>
    )
  }

  const product = productQuery.data
  if (!product) return null

  const shop = shopQuery.data
  const inventoryValue = product.price * product.stock
  const history = historyQuery.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <ImageWithFallback
            src={product.imageUrl}
            alt=""
            className="size-20 rounded-lg border sm:size-24"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">{product.name}</h1>
              <Badge variant={product.status === 'active' ? 'secondary' : 'outline'}>
                {product.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
              <StockStatusBadge stock={product.stock} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              SKU {product.sku} · {product.category}
              {shop && (
                <>
                  {' · '}
                  <Link to={`/shops/${shop.id}`} className="underline hover:text-foreground">
                    {shop.name}
                  </Link>
                </>
              )}
            </p>
            {product.description && (
              <p className="mt-2 max-w-xl text-muted-foreground">{product.description}</p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              Created {formatDate(product.createdAt)} · Updated {formatDate(product.updatedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RoleGate allow={['admin']}>
            <Button asChild variant="outline">
              <Link to={`/products/${product.id}/edit`}>
                <Pencil className="size-4" />
                Edit Product
              </Link>
            </Button>
          </RoleGate>
          <RoleGate allow={['admin']}>
            <Button variant="outline" disabled title="Coming in the next step">
              <PackagePlus className="size-4" />
              Adjust Stock
            </Button>
          </RoleGate>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Price" value={formatCurrency(product.price)} icon={DollarSign} />
        <StatCard label="Current Stock" value={formatNumber(product.stock)} icon={Layers} />
        <StatCard label="Inventory Value" value={formatCurrency(inventoryValue)} icon={Package} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Inventory Adjustment History</h2>
        {historyQuery.isPending ? (
          <Skeleton className="h-32 w-full" />
        ) : historyQuery.isError ? (
          <ErrorState message={historyQuery.error.message} onRetry={() => historyQuery.refetch()} />
        ) : (
          <InventoryHistoryTable history={history} />
        )}
      </div>
    </div>
  )
}
