import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api/client'

function isClientError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 400 && error.status < 500
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (isClientError(error)) return false
        return failureCount < 2
      },
    },
    mutations: {
      retry: false,
    },
  },
})
