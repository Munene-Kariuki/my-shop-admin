import { Badge } from '@/components/ui/badge'
import { STATUS_COLORS } from '@/lib/statusColors'
import { getStockStatus, type StockStatus } from '@/types/domain'

const CONFIG: Record<StockStatus, { label: string; color: string }> = {
  'in-stock': { label: 'In Stock', color: STATUS_COLORS.good },
  'low-stock': { label: 'Low Stock', color: STATUS_COLORS.warning },
  'out-of-stock': { label: 'Out of Stock', color: STATUS_COLORS.critical },
}

export function StockStatusBadge({ stock }: { stock: number }) {
  const status = getStockStatus(stock)
  const { label, color } = CONFIG[status]

  return (
    <Badge
      variant="outline"
      style={{ color, borderColor: color, backgroundColor: `${color}1a` }}
    >
      {label}
    </Badge>
  )
}
