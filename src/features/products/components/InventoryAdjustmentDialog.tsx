import { zodResolver } from '@hookform/resolvers/zod'
import { PackagePlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAdjustInventory } from '@/features/products/hooks'
import {
  createInventoryAdjustmentSchema,
  inventoryAdjustmentFormDefaults,
  type InventoryAdjustmentFormValues,
} from '@/features/products/inventoryAdjustmentSchema'
import { cn, formatNumber } from '@/lib/utils'
import type { Product } from '@/types/domain'

interface InventoryAdjustmentFormProps {
  product: Product
  onDone: () => void
}

function InventoryAdjustmentForm({ product, onDone }: InventoryAdjustmentFormProps) {
  const adjustInventory = useAdjustInventory(product.id)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InventoryAdjustmentFormValues>({
    // Built fresh each time the dialog opens, so it always validates against
    // the current stock level rather than a stale value from a prior open.
    resolver: zodResolver(createInventoryAdjustmentSchema(product.stock)),
    defaultValues: inventoryAdjustmentFormDefaults,
  })

  const type = watch('type')
  const amount = watch('amount')
  const resultingStock = type === 'increase' ? product.stock + (amount || 0) : product.stock - (amount || 0)

  function onSubmit(values: InventoryAdjustmentFormValues) {
    adjustInventory.mutate(values, { onSuccess: onDone })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-2">
        <Label>Adjustment Type</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={type === 'increase' ? 'default' : 'outline'}
            onClick={() => setValue('type', 'increase', { shouldValidate: true })}
            className="flex-1"
          >
            Increase
          </Button>
          <Button
            type="button"
            variant={type === 'decrease' ? 'default' : 'outline'}
            onClick={() => setValue('type', 'decrease', { shouldValidate: true })}
            className="flex-1"
          >
            Decrease
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Quantity</Label>
        <Input
          id="amount"
          type="number"
          step="1"
          min="1"
          aria-invalid={!!errors.amount}
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Textarea id="reason" rows={2} aria-invalid={!!errors.reason} {...register('reason')} />
        {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
      </div>

      <div
        className={cn(
          'rounded-md border p-3 text-sm',
          resultingStock < 0
            ? 'border-destructive/30 bg-destructive/10 text-destructive'
            : 'bg-secondary text-secondary-foreground',
        )}
      >
        Resulting stock level: <span className="font-semibold">{formatNumber(resultingStock)}</span>
        {resultingStock < 0 && ' — this would go negative.'}
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={adjustInventory.isPending}>
          {adjustInventory.isPending ? 'Saving…' : 'Adjust Stock'}
        </Button>
      </DialogFooter>
    </form>
  )
}

interface InventoryAdjustmentDialogProps {
  product: Product
}

export function InventoryAdjustmentDialog({ product }: InventoryAdjustmentDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PackagePlus className="size-4" />
          Adjust Stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust stock for {product.name}</DialogTitle>
          <DialogDescription>Current stock: {formatNumber(product.stock)}</DialogDescription>
        </DialogHeader>
        {open && <InventoryAdjustmentForm product={product} onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}
