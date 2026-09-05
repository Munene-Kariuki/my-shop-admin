import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { apiClient, ApiError, setTokenProvider } from '@/lib/api/client'
import { server } from '@/mocks/server'
import { loginAs } from '@/test/authHelpers'
import type { PaginatedResponse } from '@/types/api'
import type { ShopWithStats } from '@/types/domain'

describe('apiClient', () => {
  afterEach(() => {
    setTokenProvider(() => null)
  })

  it('throws an ApiError with the server message and status on failure', async () => {
    await expect(apiClient.get('/shops')).rejects.toMatchObject({
      name: 'ApiError',
      status: 401,
    })
  })

  it('attaches the bearer token from the registered token provider', async () => {
    const { token } = await loginAs('admin')
    setTokenProvider(() => token)

    const result = await apiClient.get<PaginatedResponse<ShopWithStats>>('/shops')
    expect(result.data.length).toBeGreaterThan(0)
  })

  it('surfaces validation error messages from the server on POST', async () => {
    const { token } = await loginAs('admin')
    setTokenProvider(() => token)

    await expect(apiClient.post('/shops', { name: '' })).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/name/i),
    })
  })

  it('resolves with undefined for a 204 response', async () => {
    const { token } = await loginAs('admin')
    setTokenProvider(() => token)

    const result = await apiClient.delete('/shops/shop-9')
    expect(result).toBeUndefined()
  })

  it('wraps a network failure in an ApiError instead of throwing raw', async () => {
    server.use(http.get('/api/network-fail-test', () => HttpResponse.error()))

    await expect(apiClient.get('/network-fail-test')).rejects.toBeInstanceOf(ApiError)
  })
})
