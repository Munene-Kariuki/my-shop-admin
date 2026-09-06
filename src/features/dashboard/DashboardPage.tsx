import { AlertTriangle, Banknote, Package, PackageX, Store } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { StatCard } from '@/components/common/StatCard'
import { Skeleton } from '@/components/ui/skeleton'
import { StockStatusChart } from '@/features/dashboard/components/StockStatusChart'
import { TopShopsChart } from '@/features/dashboard/components/TopShopsChart'
import { useDashboard } from '@/features/dashboard/hooks'
import { useAuthStore } from '@/features/auth/store'
import { getGreeting } from '@/lib/greeting'
import { formatCurrency, formatNumber } from '@/lib/utils'

export function DashboardPage() {
  const { isLoading, isError, error, isEmpty, refetch, summary, stockStatusCounts, topShops } =
    useDashboard()
  const firstName = useAuthStore((s) => s.user?.name.split(' ')[0])
  const greeting = firstName ? `${getGreeting()}, ${firstName}` : 'Dashboard'

  if (isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{greeting}</h1>
        <ErrorState message={error?.message} onRetry={refetch} />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">{greeting}</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-lg" />
          <Skeleton className="h-72 rounded-lg" />
        </div>
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">{greeting}</h1>
        <EmptyState
          title="No data yet"
          message="Add a shop and some products to see dashboard insights here."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{greeting}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Shops" value={formatNumber(summary.totalShops)} icon={Store} />
        <StatCard label="Total Products" value={formatNumber(summary.totalProducts)} icon={Package} />
        <StatCard label="Total Stock" value={formatNumber(summary.totalStock)} icon={Package} />
        <StatCard
          label="Total Inventory Value"
          value={formatCurrency(summary.totalInventoryValue)}
          icon={Banknote}
        />
        <StatCard
          label="Low-Stock Products"
          value={formatNumber(summary.lowStockCount)}
          icon={AlertTriangle}
          iconClassName="bg-[#fab219]/15 text-[#fab219]"
        />
        <StatCard
          label="Out-of-Stock Products"
          value={formatNumber(summary.outOfStockCount)}
          icon={PackageX}
          iconClassName="bg-[#d03b3b]/15 text-[#d03b3b]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <StockStatusChart data={stockStatusCounts} />
        <TopShopsChart shops={topShops} />
      </div>
    </div>
  )
}
