import type { ReactNode } from 'react'
import { useAuthStore } from '@/features/auth/store'
import type { Role } from '@/types/domain'

interface RoleGateProps {
  allow: Role[]
  children: ReactNode
  /** Rendered instead of nothing when the role check fails (e.g. a disabled button with a tooltip). */
  fallback?: ReactNode
}

/** Hides (or replaces) UI the current user's role isn't permitted to use. */
export function RoleGate({ allow, children, fallback = null }: RoleGateProps) {
  const role = useAuthStore((s) => s.user?.role)
  if (!role || !allow.includes(role)) return fallback
  return children
}
