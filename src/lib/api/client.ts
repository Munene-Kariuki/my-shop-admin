/**
 * Centralized, typed fetch wrapper. Every feature's `api.ts` goes through
 * this instead of calling `fetch` directly, so auth headers, error
 * normalization, and JSON parsing live in exactly one place.
 */

const API_BASE = '/api'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type TokenProvider = () => string | null

/**
 * The auth store (features/auth) registers its token getter here at
 * startup. Kept as an injected callback — rather than this module
 * importing the store directly — so the client has no dependency on
 * where or how the session is persisted.
 */
let tokenProvider: TokenProvider = () => null

export function setTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider
}

export function buildQueryString(params: Record<string, string | number | boolean | null | undefined>): string {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue
    searchParams.set(key, String(value))
  }
  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenProvider()
  const headers = new Headers(options.headers)
  if (options.body !== undefined) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  } catch {
    throw new ApiError('Unable to reach the server. Check your connection and try again.', 0)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    const message =
      (data as { message?: string } | null)?.message ?? 'Something went wrong. Please try again.'
    throw new ApiError(message, response.status)
  }

  return data as T
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
}
