import { z } from 'zod'

const optionalUrl = z.union([z.literal(''), z.string().trim().url('Enter a valid URL')])
const optionalEmail = z.union([
  z.literal(''),
  z.string().trim().email('Enter a valid email address'),
])

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
