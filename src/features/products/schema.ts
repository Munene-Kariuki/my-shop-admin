import { z } from 'zod'
import { optionalUrl } from '@/lib/zodHelpers'

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Product name is required'),
  sku: z.string().trim().min(1, 'SKU is required'),
  shopId: z.string().min(1, 'Shop is required'),
  category: z.string().min(1, 'Category is required'),
  price: z
    .number({ invalid_type_error: 'Price is required' })
    .gt(0, 'Price must be greater than zero'),
  stock: z
    .number({ invalid_type_error: 'Stock level is required' })
    .int('Stock level must be a whole number')
    .min(0, 'Stock level cannot be negative'),
  description: z.string().trim(),
  imageUrl: optionalUrl,
  status: z.enum(['active', 'inactive']),
})

export type ProductFormValues = z.infer<typeof productSchema>

export const productFormDefaults: ProductFormValues = {
  name: '',
  sku: '',
  shopId: '',
  category: '',
  price: 0,
  stock: 0,
  description: '',
  imageUrl: '',
  status: 'active',
}
