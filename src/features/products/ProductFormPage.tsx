import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorState } from '@/components/common/ErrorState'
import { ImageWithFallback } from '@/components/common/ImageWithFallback'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { PRODUCT_CATEGORIES } from '@/features/products/constants'
import { useCreateProduct, useProduct, useUpdateProduct } from '@/features/products/hooks'
import { productFormDefaults, productSchema, type ProductFormValues } from '@/features/products/schema'
import { useShops } from '@/features/shops/hooks'
import type { ApiError } from '@/lib/api/client'

interface ProductFormFieldsProps {
  defaultValues: ProductFormValues
  isSubmitting: boolean
  onSubmit: (values: ProductFormValues, setSkuError: (message: string) => void) => void
  submitLabel: string
}

function ProductFormFields({
  defaultValues,
  isSubmitting,
  onSubmit,
  submitLabel,
}: ProductFormFieldsProps) {
  const shopsQuery = useShops({ pageSize: 100, sort: 'name' })
  const shops = shopsQuery.data?.data ?? []

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  const imageUrl = useWatch({ control, name: 'imageUrl' })

  function submit(values: ProductFormValues) {
    onSubmit(values, (message) => setError('sku', { message }))
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="max-w-lg space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input id="name" aria-invalid={!!errors.name} {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" aria-invalid={!!errors.sku} {...register('sku')} />
        {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="shopId">Shop</Label>
        <Controller
          control={control}
          name="shopId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="shopId" className="w-full" aria-invalid={!!errors.shopId}>
                <SelectValue placeholder="Select a shop" />
              </SelectTrigger>
              <SelectContent>
                {shops.map((shop) => (
                  <SelectItem key={shop.id} value={shop.id}>
                    {shop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.shopId && <p className="text-sm text-destructive">{errors.shopId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="category" className="w-full" aria-invalid={!!errors.category}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            aria-invalid={!!errors.price}
            {...register('price', { valueAsNumber: true })}
          />
          {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock">Stock Level</Label>
          <Input
            id="stock"
            type="number"
            step="1"
            aria-invalid={!!errors.stock}
            {...register('stock', { valueAsNumber: true })}
          />
          {errors.stock && <p className="text-sm text-destructive">{errors.stock.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={3} {...register('description')} />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Product Image URL</Label>
        <Input id="imageUrl" aria-invalid={!!errors.imageUrl} {...register('imageUrl')} />
        {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl.message}</p>}
        {imageUrl && (
          <ImageWithFallback
            src={imageUrl}
            alt="Product image preview"
            className="size-24 rounded-md border"
          />
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

export function ProductFormPage() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(productId)

  const productQuery = useProduct(productId ?? '')
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct(productId ?? '')

  const mutation = isEditMode ? updateProduct : createProduct

  function handleSubmit(values: ProductFormValues, setSkuError: (message: string) => void) {
    mutation.mutate(values, {
      onSuccess: (product) => navigate(`/products/${product.id}`),
      onError: (error) => {
        if ((error as ApiError).message.toLowerCase().includes('sku')) {
          setSkuError((error as ApiError).message)
        }
      },
    })
  }

  if (isEditMode && productQuery.isPending) {
    return (
      <div className="max-w-lg space-y-4">
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (isEditMode && productQuery.isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <ErrorState message={productQuery.error.message} onRetry={() => productQuery.refetch()} />
      </div>
    )
  }

  const defaultValues: ProductFormValues = isEditMode
    ? {
        name: productQuery.data!.name,
        sku: productQuery.data!.sku,
        shopId: productQuery.data!.shopId,
        category: productQuery.data!.category,
        price: productQuery.data!.price,
        stock: productQuery.data!.stock,
        description: productQuery.data!.description,
        imageUrl: productQuery.data!.imageUrl,
        status: productQuery.data!.status,
      }
    : productFormDefaults

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">{isEditMode ? 'Edit Product' : 'New Product'}</h1>
      <ProductFormFields
        key={productId ?? 'new'}
        defaultValues={defaultValues}
        isSubmitting={mutation.isPending}
        onSubmit={handleSubmit}
        submitLabel={isEditMode ? 'Save Changes' : 'Create Product'}
      />
    </div>
  )
}
