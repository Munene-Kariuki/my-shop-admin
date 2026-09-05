import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/PublicOnlyRoute'
import { useLogout } from '@/features/auth/hooks'
import { useAuthStore } from '@/features/auth/store'

// Temporary stand-ins — replaced by the real app shell (step 8) and
// dashboard (step 9).
function DashboardStub() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">Signed in as {user?.name}</h1>
      <p className="text-muted-foreground">Role: {user?.role}</p>
      <p className="max-w-md text-sm text-muted-foreground">
        This is a temporary placeholder — the real dashboard, navigation, and layout land in the
        next steps.
      </p>
      <Button variant="outline" onClick={logout}>
        Log out
      </Button>
    </div>
  )
}

function NotFoundStub() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground">This route doesn&apos;t exist.</p>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardStub />} />
        </Route>
        <Route path="*" element={<NotFoundStub />} />
      </Routes>
    </BrowserRouter>
  )
}
