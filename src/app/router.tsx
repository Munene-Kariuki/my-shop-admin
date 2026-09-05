import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/app/layout/AppLayout'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/PublicOnlyRoute'
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

// Temporary stand-in — replaced by real shop create/edit (step 11) and
// shop details (step 12) pages.
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
            <Route path="/shops/new" element={<ComingSoonStub title="New Shop" />} />
            <Route path="/shops/:shopId" element={<ComingSoonStub title="Shop Details" />} />
            <Route path="/shops/:shopId/edit" element={<ComingSoonStub title="Edit Shop" />} />
            <Route path="/products" element={<ProductsStub />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundStub />} />
      </Routes>
    </BrowserRouter>
  )
}
