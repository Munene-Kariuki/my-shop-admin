import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/EmptyState'
import { SEQUENTIAL_BLUE } from '@/features/dashboard/chartColors'
import { formatCurrency } from '@/lib/utils'
import type { ShopWithStats } from '@/types/domain'

export function TopShopsChart({ shops }: { shops: ShopWithStats[] }) {
  const data = shops.map((shop) => ({ name: shop.name, value: shop.totalInventoryValue }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Shops by Inventory Value</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState title="No shops yet" message="Top shops will appear here once shops are added." />
        ) : (
          <div
            className="h-64"
            role="img"
            aria-label={data.map((d) => `${d.name}: ${formatCurrency(d.value)}`).join(', ')}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 8, right: 56, left: 8, bottom: 8 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'var(--secondary)' }}
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill={SEQUENTIAL_BLUE} radius={[0, 4, 4, 0]} maxBarSize={24}>
                  <LabelList
                    dataKey="value"
                    position="right"
                    formatter={(value) => formatCurrency(Number(value))}
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
