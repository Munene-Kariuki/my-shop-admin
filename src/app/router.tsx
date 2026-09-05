import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/app/layout/AppLayout'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/PublicOnlyRoute'
import { RequireRole } from '@/features/auth/RequireRole'
import { ShopDetailsPage } from '@/features/shops/ShopDetailsPage'
import { ShopFormPage } from '@/features/shops/ShopFormPage'
import { ShopListPage } from '@/features/shops/ShopListPage'

// Temporary stand-in — replaced by the real product feature (step 14).
function ProductsStub() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Products</h1>
      <p className="text-muted-foreground">Product management lands in an upcoming step.</p>
    </div>
  )
}

// Temporary stand-in — replaced by the real product details page (step 16).
function ComingSoonStub({ title }: { title: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground">This page lands in an upcoming step.</p>
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
            <Route path="/shops" element={<ShopListPage />} />
            <Route
              path="/shops/new"
              element={
                <RequireRole allow={['admin']}>
                  <ShopFormPage />
                </RequireRole>
              }
            />
            <Route path="/shops/:shopId" element={<ShopDetailsPage />} />
            <Route
              path="/shops/:shopId/edit"
              element={
                <RequireRole allow={['admin']}>
                  <ShopFormPage />
                </RequireRole>
              }
            />
            <Route path="/products" element={<ProductsStub />} />
            <Route path="/products/:productId" element={<ComingSoonStub title="Product Details" />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundStub />} />
      </Routes>
    </BrowserRouter>
  )
}
