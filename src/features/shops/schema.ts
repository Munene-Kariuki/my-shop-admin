import { z } from 'zod'
import { optionalEmail, optionalUrl } from '@/lib/zodHelpers'

export const shopSchema = z.object({
  name: z.string().trim().min(1, 'Shop name is required'),
  description: z.string().trim(),
  logoUrl: optionalUrl,
  contactEmail: optionalEmail,
  status: z.enum(['active', 'inactive']),
})

export type ShopFormValues = z.infer<typeof shopSchema>

export const shopFormDefaults: ShopFormValues = {
  name: '',
  description: '',
  logoUrl: '',
  contactEmail: '',
  status: 'active',
}
