import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { useAuthStore } from '@/features/auth/store'
import { resetDb } from '@/mocks/db'
import { server } from '@/mocks/server'

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })

  // jsdom doesn't implement these — Radix UI's Select (and other pointer-based
  // primitives) call them during interaction, which throws under jsdom otherwise.
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {}
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {}
  }
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
