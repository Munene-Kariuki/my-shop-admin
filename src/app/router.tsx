import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/app/layout/AppLayout'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/PublicOnlyRoute'

// Temporary stand-ins — replaced by the real shop/product features (steps 10-17).
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/shops" element={<ShopsStub />} />
            <Route path="/products" element={<ProductsStub />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundStub />} />
      </Routes>
    </BrowserRouter>
  )
}
