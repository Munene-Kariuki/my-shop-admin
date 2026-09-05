import { Loader2, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { useDeleteShop } from '@/features/shops/hooks'
import { ApiError } from '@/lib/api/client'
import type { ShopWithStats } from '@/types/domain'

interface DeleteShopDialogProps {
  shop: ShopWithStats
  trigger?: ReactNode
  onDeleted?: () => void
}

export function DeleteShopDialog({ shop, trigger, onDeleted }: DeleteShopDialogProps) {
  const [open, setOpen] = useState(false)
  const deleteShop = useDeleteShop()

  const isBlocked = deleteShop.error instanceof ApiError && deleteShop.error.status === 409

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) deleteShop.reset()
  }

  function handleConfirm(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    if (deleteShop.isPending) return

    deleteShop.mutate(shop.id, {
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
          <Button variant="ghost" size="icon" aria-label={`Delete ${shop.name}`}>
            <Trash2 className="size-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &quot;{shop.name}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {shop.name}. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isBlocked && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <p>This shop still has products assigned to it and cannot be deleted.</p>
            <Link
              to={`/shops/${shop.id}`}
              className="mt-1 inline-block font-medium underline"
              onClick={() => setOpen(false)}
            >
              View this shop&apos;s products
            </Link>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteShop.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteShop.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Deleting…
              </>
            ) : (
              'Delete Shop'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
