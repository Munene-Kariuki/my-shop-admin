import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { STATUS_COLORS } from '@/features/dashboard/chartColors'
import type { StockStatusCount } from '@/features/dashboard/hooks'

const BAR_COLOR: Record<StockStatusCount['status'], string> = {
  'in-stock': STATUS_COLORS.good,
  'low-stock': STATUS_COLORS.warning,
  'out-of-stock': STATUS_COLORS.critical,
}

export function StockStatusChart({ data }: { data: StockStatusCount[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Stock Status</CardTitle>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <EmptyState title="No products yet" message="Stock status will appear here once products are added." />
        ) : (
          <div
            className="h-64"
            role="img"
            aria-label={data.map((d) => `${d.label}: ${d.count} products`).join(', ')}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'var(--secondary)' }}
                  contentStyle={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={64}>
                  {data.map((entry) => (
                    <Cell key={entry.status} fill={BAR_COLOR[entry.status]} />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="top"
                    style={{ fill: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
