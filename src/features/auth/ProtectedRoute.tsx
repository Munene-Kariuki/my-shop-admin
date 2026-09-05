import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { FullPageSpinner } from '@/components/common/FullPageSpinner'
import { useSessionQuery } from '@/features/auth/hooks'
import { useAuthStore } from '@/features/auth/store'

export function ProtectedRoute() {
  const location = useLocation()
  const token = useAuthStore((s) => s.token)
  const clearSession = useAuthStore((s) => s.clearSession)
  const sessionQuery = useSessionQuery()

  useEffect(() => {
    if (sessionQuery.isError) {
      toast.error(sessionQuery.error.message)
      clearSession()
    }
  }, [sessionQuery.isError, sessionQuery.error, clearSession])

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (sessionQuery.isPending) {
    return <FullPageSpinner />
  }

  if (sessionQuery.isError) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
