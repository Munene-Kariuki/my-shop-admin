import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { DollarSign, Layers, Package, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { DataTable } from '@/components/common/DataTable'
import { DataTablePagination } from '@/components/common/DataTablePagination'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { RoleGate } from '@/components/common/RoleGate'
import { StatCard } from '@/components/common/StatCard'
import { StockStatusBadge } from '@/components/common/StockStatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useProducts } from '@/features/products/hooks'
import { DeleteShopDialog } from '@/features/shops/components/DeleteShopDialog'
import { useShop } from '@/features/shops/hooks'
import { useDebounce } from '@/hooks/useDebounce'
import { useUrlState } from '@/hooks/useUrlState'
import { ApiError } from '@/lib/api/client'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import type { Product } from '@/types/domain'

const DEFAULT_STATE = { search: '', sort: 'name', sortDir: 'asc', page: '1' }
const PAGE_SIZE = 10

const productColumns: ColumnDef<Product>[] = [
  {
    id: 'image',
    header: 'Image',
    enableSorting: false,
    cell: ({ row }) => (
      <ImageWithFallback src={row.original.imageUrl} alt="" className="size-10 rounded-md border" />
    ),
  },
  {
    accessorKey: 'name',
    header: 'Product Name',
    cell: ({ row }) => (
      <Link to={`/products/${row.original.id}`} className="font-medium hover:underline">
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: 'sku', header: 'SKU' },
  { accessorKey: 'category', header: 'Category', enableSorting: false },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
    cell: ({ row }) => formatNumber(row.original.stock),
  },
  {
    id: 'stockStatus',
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => <StockStatusBadge stock={row.original.stock} />,
  },
]

export function ShopDetailsPage() {
  const { shopId } = useParams<{ shopId: string }>()
  const navigate = useNavigate()
  const shopQuery = useShop(shopId ?? '')

  const [urlState, setUrlState] = useUrlState(DEFAULT_STATE)
  const [searchInput, setSearchInput] = useState(urlState.search)
  const debouncedSearch = useDebounce(searchInput, 350)

  useEffect(() => {
    if (debouncedSearch !== urlState.search) {
      setUrlState({ search: debouncedSearch, page: '1' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced value changing
  }, [debouncedSearch])

  const page = Number(urlState.page) || 1
  const sorting: SortingState = urlState.sort
    ? [{ id: urlState.sort, desc: urlState.sortDir === 'desc' }]
    : []

  const productsQuery = useProducts({
    shopId,
    search: urlState.search || undefined,
    sort: urlState.sort,
    sortDir: urlState.sortDir as 'asc' | 'desc',
    page,
    pageSize: PAGE_SIZE,
  })

  function handleSortingChange(next: SortingState) {
    const [first] = next
    setUrlState({
      sort: first?.id ?? DEFAULT_STATE.sort,
      sortDir: first?.desc ? 'desc' : 'asc',
      page: '1',
    })
  }

  if (shopQuery.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  if (shopQuery.isError) {
    const notFound = shopQuery.error instanceof ApiError && shopQuery.error.status === 404
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Shop Details</h1>
        {notFound ? (
          <EmptyState
            title="Shop not found"
            message="This shop may have been deleted, or the link is incorrect."
            action={
              <Button asChild variant="outline" size="sm">
                <Link to="/shops">Back to Shops</Link>
              </Button>
            }
          />
        ) : (
          <ErrorState message={shopQuery.error.message} onRetry={() => shopQuery.refetch()} />
        )}
      </div>
    )
  }

  const shop = shopQuery.data
  if (!shop) return null

  const products = productsQuery.data?.data ?? []
  const total = productsQuery.data?.total ?? 0
  const hasFilters = urlState.search !== ''

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <ImageWithFallback src={shop.logoUrl} alt="" className="size-16 rounded-lg border" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold">{shop.name}</h1>
              <Badge variant={shop.status === 'active' ? 'secondary' : 'outline'}>
                {shop.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
            {shop.description && (
              <p className="mt-1 max-w-xl text-muted-foreground">{shop.description}</p>
            )}
            {shop.contactEmail && (
              <p className="mt-1 text-sm text-muted-foreground">{shop.contactEmail}</p>
            )}
            <p className="mt-1 text-sm text-muted-foreground">Created {formatDate(shop.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RoleGate allow={['admin']}>
            <Button asChild variant="outline">
              <Link to={`/shops/${shop.id}/edit`}>
                <Pencil className="size-4" />
                Edit Shop
              </Link>
            </Button>
          </RoleGate>
          <RoleGate allow={['admin']}>
            <DeleteShopDialog
              shop={shop}
              onDeleted={() => navigate('/shops')}
              trigger={
                <Button variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 className="size-4" />
                  Delete Shop
                </Button>
              }
            />
          </RoleGate>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Products" value={formatNumber(shop.productCount)} icon={Package} />
        <StatCard label="Total Stock" value={formatNumber(shop.totalStock)} icon={Layers} />
        <StatCard
          label="Total Inventory Value"
          value={formatCurrency(shop.totalInventoryValue)}
          icon={DollarSign}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Products</h2>
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search this shop's products…"
          aria-label="Search this shop's products"
          className="max-w-sm"
        />
        <DataTable
          columns={productColumns}
          data={products}
          sorting={sorting}
          onSortingChange={handleSortingChange}
          isLoading={productsQuery.isPending}
          getRowId={(product) => product.id}
          emptyState={
            hasFilters ? (
              <EmptyState
                title="No products match your search"
                message="Try a different search term, or clear the search."
                action={
                  <Button variant="outline" size="sm" onClick={() => setSearchInput('')}>
                    Clear search
                  </Button>
                }
              />
            ) : (
              <EmptyState title="No products yet" message="This shop doesn't have any products yet." />
            )
          }
        />
        {!productsQuery.isPending && products.length > 0 && (
          <DataTablePagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={(nextPage) => setUrlState({ page: String(nextPage) })}
          />
        )}
      </div>
    </div>
  )
}
