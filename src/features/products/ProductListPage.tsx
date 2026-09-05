import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Package, Pencil, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DataTable } from '@/components/common/DataTable'
import { DataTablePagination } from '@/components/common/DataTablePagination'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { RoleGate } from '@/components/common/RoleGate'
import { StockStatusBadge } from '@/components/common/StockStatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PRODUCT_CATEGORIES, STOCK_STATUS_OPTIONS } from '@/features/products/constants'
import { DeleteProductDialog } from '@/features/products/components/DeleteProductDialog'
import { useProducts } from '@/features/products/hooks'
import { useShops } from '@/features/shops/hooks'
import { useDebounce } from '@/hooks/useDebounce'
import { useUrlState } from '@/hooks/useUrlState'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import type { Product, StockStatus } from '@/types/domain'

const DEFAULT_STATE = {
  search: '',
  shopId: '',
  category: '',
  stockStatus: '',
  sort: 'name',
  sortDir: 'asc',
  page: '1',
}
const PAGE_SIZE = 10

export function ProductListPage() {
  const [urlState, setUrlState] = useUrlState(DEFAULT_STATE)
  const [searchInput, setSearchInput] = useState(urlState.search)
  const debouncedSearch = useDebounce(searchInput, 350)

  useEffect(() => {
    if (debouncedSearch !== urlState.search) {
      setUrlState({ search: debouncedSearch, page: '1' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced value changing
  }, [debouncedSearch])

  const shopsQuery = useShops({ pageSize: 100, sort: 'name' })
  const shops = useMemo(() => shopsQuery.data?.data ?? [], [shopsQuery.data])
  const shopNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const shop of shops) map.set(shop.id, shop.name)
    return map
  }, [shops])

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        id: 'image',
        header: 'Image',
        enableSorting: false,
        cell: ({ row }) => (
          <ImageWithFallback
            src={row.original.imageUrl}
            alt=""
            className="size-10 rounded-md border"
          />
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
      { accessorKey: 'sku', header: 'SKU', enableSorting: false },
      {
        id: 'shop',
        header: 'Shop',
        enableSorting: false,
        cell: ({ row }) => shopNameById.get(row.original.shopId) ?? '—',
      },
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
      {
        accessorKey: 'updatedAt',
        header: 'Last Updated',
        cell: ({ row }) => formatDate(row.original.updatedAt),
      },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/products/${row.original.id}`}>View</Link>
            </Button>
            <RoleGate allow={['admin']}>
              <Button variant="ghost" size="icon" asChild>
                <Link
                  to={`/products/${row.original.id}/edit`}
                  aria-label={`Edit ${row.original.name}`}
                >
                  <Pencil className="size-4" />
                </Link>
              </Button>
            </RoleGate>
            <RoleGate allow={['admin']}>
              <DeleteProductDialog product={row.original} />
            </RoleGate>
          </div>
        ),
      },
    ],
    [shopNameById],
  )

  const page = Number(urlState.page) || 1
  const sorting: SortingState = urlState.sort
    ? [{ id: urlState.sort, desc: urlState.sortDir === 'desc' }]
    : []

  const productsQuery = useProducts({
    search: urlState.search || undefined,
    shopId: urlState.shopId || undefined,
    category: urlState.category || undefined,
    stockStatus: (urlState.stockStatus || undefined) as StockStatus | undefined,
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

  function clearFilters() {
    setSearchInput('')
    setUrlState({
      search: '',
      shopId: '',
      category: '',
      stockStatus: '',
      sort: DEFAULT_STATE.sort,
      sortDir: DEFAULT_STATE.sortDir,
      page: '1',
    })
  }

  const products = productsQuery.data?.data ?? []
  const total = productsQuery.data?.total ?? 0
  const hasFilters =
    urlState.search !== '' ||
    urlState.shopId !== '' ||
    urlState.category !== '' ||
    urlState.stockStatus !== ''

  if (productsQuery.isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <ErrorState message={productsQuery.error.message} onRetry={() => productsQuery.refetch()} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Products</h1>
        <RoleGate allow={['admin']}>
          <Button asChild>
            <Link to="/products/new">New Product</Link>
          </Button>
        </RoleGate>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search by name or SKU…"
          aria-label="Search products by name or SKU"
          className="max-w-xs"
        />

        <Select
          value={urlState.shopId || 'all'}
          onValueChange={(value) => setUrlState({ shopId: value === 'all' ? '' : value, page: '1' })}
        >
          <SelectTrigger className="w-40" aria-label="Filter by shop">
            <SelectValue placeholder="All Shops" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shops</SelectItem>
            {shops.map((shop) => (
              <SelectItem key={shop.id} value={shop.id}>
                {shop.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={urlState.category || 'all'}
          onValueChange={(value) => setUrlState({ category: value === 'all' ? '' : value, page: '1' })}
        >
          <SelectTrigger className="w-40" aria-label="Filter by category">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {PRODUCT_CATEGORIES.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={urlState.stockStatus || 'all'}
          onValueChange={(value) =>
            setUrlState({ stockStatus: value === 'all' ? '' : value, page: '1' })
          }
        >
          <SelectTrigger className="w-40" aria-label="Filter by stock status">
            <SelectValue placeholder="All Stock Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stock Statuses</SelectItem>
            {STOCK_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="size-4" />
            Clear filters
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={products}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        isLoading={productsQuery.isPending}
        getRowId={(product) => product.id}
        emptyState={
          hasFilters ? (
            <EmptyState
              icon={Package}
              title="No products match your filters"
              message="Try different filters, or clear them to see everything."
              action={
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Package}
              title="No products yet"
              message="Create your first product to start tracking inventory."
            />
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
  )
}
