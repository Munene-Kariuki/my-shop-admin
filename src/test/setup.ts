import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { useAuthStore } from '@/features/auth/store'
import { resetDb } from '@/mocks/db'
import { server } from '@/mocks/server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  resetDb()
  useAuthStore.setState({ user: null, token: null })
})

afterAll(() => {
  server.close()
})
