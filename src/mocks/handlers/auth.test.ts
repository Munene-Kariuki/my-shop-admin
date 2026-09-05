import { describe, expect, it } from 'vitest'
import { authHeaders, loginAs } from '@/test/authHelpers'
import type { ApiErrorBody, LoginResponseBody, SessionResponseBody } from '@/types/api'

describe('POST /api/auth/login', () => {
  it('returns a user and token for valid admin credentials', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@myshop.test', password: 'password123' }),
    })

    expect(response.status).toBe(200)
    const body = (await response.json()) as LoginResponseBody
    expect(body.user.role).toBe('admin')
    expect(body.user).not.toHaveProperty('password')
    expect(body.token).toEqual(expect.any(String))
  })

  it('rejects an invalid password', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@myshop.test', password: 'wrong' }),
    })

    expect(response.status).toBe(401)
    const body = (await response.json()) as ApiErrorBody
    expect(body.message).toMatch(/invalid email or password/i)
  })

  it('rejects a missing password', async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@myshop.test' }),
    })

    expect(response.status).toBe(400)
  })
})

describe('GET /api/auth/session', () => {
  it('returns the current user for a valid token', async () => {
    const { token } = await loginAs('viewer')

    const response = await fetch('/api/auth/session', { headers: authHeaders(token) })

    expect(response.status).toBe(200)
    const body = (await response.json()) as SessionResponseBody
    expect(body.user.role).toBe('viewer')
  })

  it('rejects a request with no token', async () => {
    const response = await fetch('/api/auth/session')
    expect(response.status).toBe(401)
  })

  it('rejects a malformed token', async () => {
    const response = await fetch('/api/auth/session', {
      headers: { Authorization: 'Bearer not-a-real-token' },
    })
    expect(response.status).toBe(401)
  })
})
