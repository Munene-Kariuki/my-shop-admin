import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchSession, login } from '@/features/auth/api'
import { useAuthStore } from '@/features/auth/store'
import { queryKeys } from '@/lib/queryKeys'
import type { LoginRequestBody } from '@/types/api'

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession)

  return useMutation({
    mutationFn: (credentials: LoginRequestBody) => login(credentials),
    onSuccess: (data) => {
      setSession(data.user, data.token)
    },
  })
}

/** Validates the persisted token on protected-route mount, catching expired/invalid sessions. */
export function useSessionQuery() {
  const token = useAuthStore((s) => s.token)

  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: fetchSession,
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession)
  const queryClient = useQueryClient()

  return () => {
    clearSession()
    queryClient.clear()
  }
}
