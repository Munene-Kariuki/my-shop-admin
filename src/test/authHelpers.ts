import { seedUsers } from '@/mocks/seed/users'
import type { LoginResponseBody } from '@/types/api'
import type { Role } from '@/types/domain'

/** Logs in as the seeded admin/viewer user and returns their session token. */
export async function loginAs(role: Role): Promise<LoginResponseBody> {
  const user = seedUsers.find((u) => u.role === role)
  if (!user) throw new Error(`No seed user with role "${role}"`)

  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, password: user.password }),
  })
  if (!response.ok) throw new Error(`loginAs(${role}) failed: ${response.status}`)
  return response.json() as Promise<LoginResponseBody>
}

export function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
}
