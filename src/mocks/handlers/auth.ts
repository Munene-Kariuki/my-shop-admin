import { http, HttpResponse } from 'msw'
import { AuthError, issueToken, requireAuth, toPublicUser } from '@/mocks/auth'
import { db } from '@/mocks/db'
import { delay } from '@/mocks/utils'
import type {
  ApiErrorBody,
  LoginRequestBody,
  LoginResponseBody,
  SessionResponseBody,
} from '@/types/api'

export const authHandlers = [
  http.post<never, LoginRequestBody, LoginResponseBody | ApiErrorBody>(
    '/api/auth/login',
    async ({ request }) => {
      await delay()

      const body = (await request.json()) as Partial<LoginRequestBody>
      const email = body.email?.trim().toLowerCase()
      const password = body.password

      if (!email || !password) {
        return HttpResponse.json(
          { message: 'Email and password are required.' },
          { status: 400 },
        )
      }

      const user = db.users.find((u) => u.email.toLowerCase() === email)
      if (!user || user.password !== password) {
        return HttpResponse.json({ message: 'Invalid email or password.' }, { status: 401 })
      }

      const token = issueToken(user.id)
      return HttpResponse.json({
        user: toPublicUser(user.id),
        token,
        expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      })
    },
  ),

  http.get<never, never, SessionResponseBody | ApiErrorBody>(
    '/api/auth/session',
    async ({ request }) => {
      await delay(150)

      try {
        const user = requireAuth(request)
        return HttpResponse.json({ user })
      } catch (error) {
        if (error instanceof AuthError) {
          return HttpResponse.json({ message: error.message }, { status: error.status })
        }
        throw error
      }
    },
  ),
]
