import type { ColumnDef, SortingState } from '@tanstack/react-table'
import { Pencil, Plus, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DataTable } from '@/components/common/DataTable'
import { DataTablePagination } from '@/components/common/DataTablePagination'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { RoleGate } from '@/components/common/RoleGate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DeleteShopDialog } from '@/features/shops/components/DeleteShopDialog'
import { useShops } from '@/features/shops/hooks'
import { useDebounce } from '@/hooks/useDebounce'
import { useUrlState } from '@/hooks/useUrlState'
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils'
import type { ShopWithStats } from '@/types/domain'

const DEFAULT_STATE = { search: '', sort: 'name', sortDir: 'asc', page: '1' }
const PAGE_SIZE = 10

const columns: ColumnDef<ShopWithStats>[] = [
  {
    id: 'logo',
    header: 'Logo',
    enableSorting: false,
    cell: ({ row }) => (
      <ImageWithFallback
        src={row.original.logoUrl}
        alt=""
        className="size-10 rounded-md border"
      />
    ),
  },
  {
    accessorKey: 'name',
    header: 'Shop Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.original.name}</span>
        {row.original.status === 'inactive' && <Badge variant="secondary">Inactive</Badge>}
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    enableSorting: false,
    cell: ({ row }) => (
      <p className="line-clamp-1 max-w-64 text-sm text-muted-foreground">
        {row.original.description || '—'}
      </p>
    ),
  },
  {
    accessorKey: 'productCount',
    header: 'Products',
    cell: ({ row }) => formatNumber(row.original.productCount),
  },
  {
    accessorKey: 'totalStock',
    header: 'Total Stock',
    cell: ({ row }) => formatNumber(row.original.totalStock),
  },
  {
    accessorKey: 'totalInventoryValue',
    header: 'Inventory Value',
    cell: ({ row }) => formatCurrency(row.original.totalInventoryValue),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    id: 'actions',
    header: 'Actions',
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/shops/${row.original.id}`}>View</Link>
        </Button>
        <RoleGate allow={['admin']}>
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/shops/${row.original.id}/edit`} aria-label={`Edit ${row.original.name}`}>
              <Pencil className="size-4" />
            </Link>
          </Button>
        </RoleGate>
        <RoleGate allow={['admin']}>
          <DeleteShopDialog shop={row.original} />
        </RoleGate>
      </div>
    ),
  },
]

export function ShopListPage() {
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

  const shopsQuery = useShops({
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

  const shops = shopsQuery.data?.data ?? []
  const total = shopsQuery.data?.total ?? 0
  const hasFilters = urlState.search !== ''

  if (shopsQuery.isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Shops</h1>
        <ErrorState message={shopsQuery.error.message} onRetry={() => shopsQuery.refetch()} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Shops</h1>
        <RoleGate allow={['admin']}>
          <Button asChild>
            <Link to="/shops/new">
              <Plus className="size-4" />
              New Shop
            </Link>
          </Button>
        </RoleGate>
      </div>

      <Input
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder="Search by shop name…"
        aria-label="Search shops by name"
        className="max-w-sm"
      />

      <DataTable
        columns={columns}
        data={shops}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        isLoading={shopsQuery.isPending}
        getRowId={(shop) => shop.id}
        emptyState={
          hasFilters ? (
            <EmptyState
              icon={Store}
              title="No shops match your search"
              message="Try a different shop name, or clear the search."
              action={
                <Button variant="outline" size="sm" onClick={() => setSearchInput('')}>
                  Clear search
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Store}
              title="No shops yet"
              message="Create your first shop to start managing products."
            />
          )
        }
      />

      {!shopsQuery.isPending && shops.length > 0 && (
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
