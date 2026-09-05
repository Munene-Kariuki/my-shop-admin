import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/common/ErrorState'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useCreateShop, useShop, useUpdateShop } from '@/features/shops/hooks'
import { shopFormDefaults, shopSchema, type ShopFormValues } from '@/features/shops/schema'

interface ShopFormFieldsProps {
  defaultValues: ShopFormValues
  isSubmitting: boolean
  onSubmit: (values: ShopFormValues) => void
  submitLabel: string
}

function ShopFormFields({ defaultValues, isSubmitting, onSubmit, submitLabel }: ShopFormFieldsProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ShopFormValues>({
    resolver: zodResolver(shopSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Shop Name</Label>
        <Input id="name" aria-invalid={!!errors.name} {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register('description')} />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="logoUrl">Logo URL</Label>
        <Input id="logoUrl" aria-invalid={!!errors.logoUrl} {...register('logoUrl')} />
        {errors.logoUrl && <p className="text-sm text-destructive">{errors.logoUrl.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactEmail">Contact Email</Label>
        <Input
          id="contactEmail"
          type="email"
          aria-invalid={!!errors.contactEmail}
          {...register('contactEmail')}
        />
        {errors.contactEmail && (
          <p className="text-sm text-destructive">{errors.contactEmail.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : submitLabel}
      </Button>
    </form>
  )
}

export function ShopFormPage() {
  const { shopId } = useParams<{ shopId: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(shopId)

  const shopQuery = useShop(shopId ?? '')
  const createShop = useCreateShop()
  const updateShop = useUpdateShop(shopId ?? '')

  const mutation = isEditMode ? updateShop : createShop

  function handleSubmit(values: ShopFormValues) {
    mutation.mutate(values, {
      onSuccess: () => navigate('/shops'),
    })
  }

  if (isEditMode && shopQuery.isPending) {
    return (
      <div className="max-w-lg space-y-4">
        <h1 className="text-2xl font-semibold">Edit Shop</h1>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (isEditMode && shopQuery.isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Edit Shop</h1>
        <ErrorState message={shopQuery.error.message} onRetry={() => shopQuery.refetch()} />
      </div>
    )
  }

  const defaultValues: ShopFormValues = isEditMode
    ? {
        name: shopQuery.data!.name,
        description: shopQuery.data!.description,
        logoUrl: shopQuery.data!.logoUrl,
        contactEmail: shopQuery.data!.contactEmail,
        status: shopQuery.data!.status,
      }
    : shopFormDefaults

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{isEditMode ? 'Edit Shop' : 'New Shop'}</h1>
      <ShopFormFields
        key={shopId ?? 'new'}
        defaultValues={defaultValues}
        isSubmitting={mutation.isPending}
        onSubmit={handleSubmit}
        submitLabel={isEditMode ? 'Save Changes' : 'Create Shop'}
      />
    </div>
  )
}
