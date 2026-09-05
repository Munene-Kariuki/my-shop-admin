import { z } from 'zod'

/** An optional URL field: empty string is fine, but a non-empty value must be a valid URL. */
export const optionalUrl = z.union([z.literal(''), z.string().trim().url('Enter a valid URL')])

/** An optional email field: empty string is fine, but a non-empty value must be a valid email. */
export const optionalEmail = z.union([
  z.literal(''),
  z.string().trim().email('Enter a valid email address'),
])
