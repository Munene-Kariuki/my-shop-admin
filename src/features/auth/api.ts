import { apiClient } from '@/lib/api/client'
import type { LoginRequestBody, LoginResponseBody, SessionResponseBody } from '@/types/api'

export function login(credentials: LoginRequestBody): Promise<LoginResponseBody> {
  return apiClient.post<LoginResponseBody>('/auth/login', credentials)
}

export function fetchSession(): Promise<SessionResponseBody> {
  return apiClient.get<SessionResponseBody>('/auth/session')
}
