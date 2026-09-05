import { z } from 'zod'

/** Built per-product so the negative-stock check can see the current stock level. */
export function createInventoryAdjustmentSchema(currentStock: number) {
  return z
    .object({
      type: z.enum(['increase', 'decrease']),
      amount: z
        .number({ invalid_type_error: 'Quantity is required' })
        .int('Quantity must be a whole number')
        .gt(0, 'Quantity must be greater than zero'),
      reason: z.string().trim().min(1, 'Please provide a reason for this adjustment'),
    })
    .refine(
      (data) => {
        const resultingStock =
          data.type === 'increase' ? currentStock + data.amount : currentStock - data.amount
        return resultingStock >= 0
      },
      { message: 'This adjustment would result in negative stock.', path: ['amount'] },
    )
}

export type InventoryAdjustmentFormValues = {
  type: 'increase' | 'decrease'
  amount: number
  reason: string
}

export const inventoryAdjustmentFormDefaults: InventoryAdjustmentFormValues = {
  type: 'increase',
  amount: 1,
  reason: '',
}
