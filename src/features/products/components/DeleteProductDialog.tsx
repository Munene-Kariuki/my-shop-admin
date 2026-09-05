import { Loader2, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useDeleteProduct } from '@/features/products/hooks'
import type { Product } from '@/types/domain'

interface DeleteProductDialogProps {
  product: Product
  trigger?: ReactNode
  onDeleted?: () => void
}

export function DeleteProductDialog({ product, trigger, onDeleted }: DeleteProductDialogProps) {
  const [open, setOpen] = useState(false)
  const deleteProduct = useDeleteProduct()

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) deleteProduct.reset()
  }

  function handleConfirm(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    if (deleteProduct.isPending) return

    deleteProduct.mutate(product.id, {
      onSuccess: () => {
        setOpen(false)
        onDeleted?.()
      },
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" aria-label={`Delete ${product.name}`}>
            <Trash2 className="size-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{product.name}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {product.name}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteProduct.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteProduct.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Deleting…
              </>
            ) : (
              'Delete Product'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
