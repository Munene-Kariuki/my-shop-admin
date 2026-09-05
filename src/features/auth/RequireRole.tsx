import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/features/auth/store'
import type { Role } from '@/types/domain'

interface RequireRoleProps {
  allow: Role[]
  children: React.ReactNode
}

/**
 * Route-level RBAC guard — blocks direct navigation to a URL whose action
 * the current role can't perform, in addition to RoleGate hiding the
 * triggering button/link in the UI.
 */
export function RequireRole({ allow, children }: RequireRoleProps) {
  const role = useAuthStore((s) => s.user?.role)
  const permitted = !!role && allow.includes(role)

  useEffect(() => {
    if (!permitted) {
      toast.error('You do not have permission to view that page.')
    }
  }, [permitted])

  if (!permitted) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
