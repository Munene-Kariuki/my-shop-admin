import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/app/layout/AppLayout'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { PublicOnlyRoute } from '@/features/auth/PublicOnlyRoute'
import { RequireRole } from '@/features/auth/RequireRole'
import { NotFoundPage } from '@/features/NotFoundPage'
import { ProductDetailsPage } from '@/features/products/ProductDetailsPage'
import { ProductFormPage } from '@/features/products/ProductFormPage'
import { ProductListPage } from '@/features/products/ProductListPage'
import { ShopDetailsPage } from '@/features/shops/ShopDetailsPage'
import { ShopFormPage } from '@/features/shops/ShopFormPage'
import { ShopListPage } from '@/features/shops/ShopListPage'

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
            <Route path="/products" element={<ProductListPage />} />
            <Route
              path="/products/new"
              element={
                <RequireRole allow={['admin']}>
                  <ProductFormPage />
                </RequireRole>
              }
            />
            <Route path="/products/:productId" element={<ProductDetailsPage />} />
            <Route
              path="/products/:productId/edit"
              element={
                <RequireRole allow={['admin']}>
                  <ProductFormPage />
                </RequireRole>
              }
            />
          </Route>
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
