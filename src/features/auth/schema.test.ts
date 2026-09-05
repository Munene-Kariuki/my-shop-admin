import { describe, expect, it } from 'vitest'
import { loginSchema } from '@/features/auth/schema'

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    const result = loginSchema.safeParse({ email: 'admin@myshop.test', password: 'password123' })
    expect(result.success).toBe(true)
  })

  it('rejects a missing email', () => {
    const result = loginSchema.safeParse({ email: '', password: 'password123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/email is required/i)
    }
  })

  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({ email: 'not-an-email', password: 'password123' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/valid email/i)
    }
  })

  it('rejects a missing password', () => {
    const result = loginSchema.safeParse({ email: 'admin@myshop.test', password: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/password is required/i)
    }
  })
})
