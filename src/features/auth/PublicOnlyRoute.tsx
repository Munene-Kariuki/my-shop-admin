import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/store'

/** Keeps already-authenticated users off /login. */
export function PublicOnlyRoute() {
  const token = useAuthStore((s) => s.token)

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
