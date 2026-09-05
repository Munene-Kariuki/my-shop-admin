import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/app/layout/AppLayout'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/PublicOnlyRoute'
import { useAuthStore } from '@/features/auth/store'

// Temporary stand-ins — replaced by the real dashboard (step 9) and
// shop/product features (steps 10-17).
function DashboardStub() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">
        Signed in as {user?.name} ({user?.role}). Summary cards and charts land in the next step.
      </p>
    </div>
  )
}

function ShopsStub() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Shops</h1>
      <p className="text-muted-foreground">Shop management lands in an upcoming step.</p>
    </div>
  )
}

function ProductsStub() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Products</h1>
      <p className="text-muted-foreground">Product management lands in an upcoming step.</p>
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
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardStub />} />
            <Route path="/shops" element={<ShopsStub />} />
            <Route path="/products" element={<ProductsStub />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundStub />} />
      </Routes>
    </BrowserRouter>
  )
}
