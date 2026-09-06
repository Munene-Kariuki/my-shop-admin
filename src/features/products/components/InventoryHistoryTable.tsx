import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn, formatDate, formatNumber } from '@/lib/utils'
import type { InventoryAdjustment } from '@/types/domain'

interface InventoryHistoryTableProps {
  history: InventoryAdjustment[]
}

export function InventoryHistoryTable({ history }: InventoryHistoryTableProps) {
  if (history.length === 0) {
    return (
      <EmptyState
        title="No adjustments yet"
        message="Stock adjustments will appear here once they're made."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Change</TableHead>
            <TableHead>Previous</TableHead>
            <TableHead>New Stock</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>User</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="whitespace-nowrap">{formatDate(entry.date)}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 font-medium',
                    entry.type === 'increase' ? 'text-emerald-600' : 'text-destructive',
                  )}
                >
                  {entry.type === 'increase' ? (
                    <ArrowUpCircle className="size-4" aria-hidden="true" />
                  ) : (
                    <ArrowDownCircle className="size-4" aria-hidden="true" />
                  )}
                  {entry.type === 'increase' ? '+' : '-'}
                  {formatNumber(entry.amount)}
                </span>
              </TableCell>
              <TableCell>{formatNumber(entry.previousStock)}</TableCell>
              <TableCell>{formatNumber(entry.newStock)}</TableCell>
              <TableCell className="max-w-64">
                <p className="line-clamp-2 text-sm text-muted-foreground">{entry.reason}</p>
              </TableCell>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {entry.userName}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
