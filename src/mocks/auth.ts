import { db } from '@/mocks/db'
import type { AuthenticatedUser } from '@/types/domain'

/**
 * Mock-only stand-in for a signed session token. It is deliberately NOT a
 * real JWT (no signature) — see README for how this would differ in
 * production (server-issued signed tokens, httpOnly cookies, refresh flow).
 */
interface TokenPayload {
  userId: string
  exp: number
}

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000 // 12 hours

export function issueToken(userId: string): string {
  const payload: TokenPayload = { userId, exp: Date.now() + TOKEN_TTL_MS }
  return btoa(JSON.stringify(payload))
}

function decodeToken(token: string): TokenPayload | null {
  try {
    const payload = JSON.parse(atob(token)) as TokenPayload
    if (typeof payload.userId !== 'string' || typeof payload.exp !== 'number') return null
    return payload
  } catch {
    return null
  }
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function toPublicUser(userId: string): AuthenticatedUser {
  const user = db.users.find((u) => u.id === userId)
  if (!user) throw new AuthError('User not found', 401)
  const { password: _password, ...publicUser } = user
  return publicUser
}

/** Reads and validates the Authorization: Bearer <token> header. */
export function requireAuth(request: Request): AuthenticatedUser {
  const header = request.headers.get('Authorization')
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null

  if (!token) throw new AuthError('Missing or invalid session. Please log in again.', 401)

  const payload = decodeToken(token)
  if (!payload) throw new AuthError('Missing or invalid session. Please log in again.', 401)
  if (payload.exp < Date.now()) throw new AuthError('Your session has expired. Please log in again.', 401)

  return toPublicUser(payload.userId)
}

export function requireRole(user: AuthenticatedUser, roles: Array<'admin' | 'viewer'>): void {
  if (!roles.includes(user.role)) {
    throw new AuthError('You do not have permission to perform this action.', 403)
  }
}
