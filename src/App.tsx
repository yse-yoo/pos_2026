import './App.css'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppHeader } from './components/layout/AppHeader'
import { AdminLoginPage } from './auth/components/AdminLoginPage'
import { AuthProvider } from './auth/hooks/AuthProvider'
import { useAuth } from './auth/hooks/useAuth'
import { CheckoutProvider } from './checkout/hooks/CheckoutProvider'
import { getViewNameFromPath } from './routing/appRoute'
import { CustomerMenuPage } from './menu/CustomerMenuPage'
import { PosPage } from './pos/PosPage'
import { ProductCreatePage, ProductEditPage } from './products/ProductFormRoutes'
import { ProductCatalogProvider } from './products/hooks/ProductCatalogProvider'
import { ProductListPage } from './products/ProductListPage'
import { SalesHistoryPage } from './sales-history/SalesHistoryPage'
import { SalesAnalyticsPage } from './sales-analytics/SalesAnalyticsPage'

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  )
}

function AuthenticatedApp() {
  const location = useLocation()
  const { staff, logout } = useAuth()
  const activeView = getViewNameFromPath(location.pathname)
  const isAdmin = staff?.role === 'admin'
  const isAdminRoute =
    activeView === 'pos' ||
    activeView === 'history' ||
    activeView === 'analytics' ||
    activeView === 'products'

  return (
    <ProductCatalogProvider>
      <CheckoutProvider>
        <div className="app-shell">
          <AppHeader
            activeView={activeView}
            staffName={staff?.name ?? null}
            isAdmin={isAdmin}
            onLogout={() => void logout()}
          />

          <main className="app-main">
            {isAdminRoute && !isAdmin ? (
              <AdminLoginPage />
            ) : (
              <Routes>
                <Route path="/" element={<CustomerMenuPage />} />
                <Route path="/menu" element={<Navigate to="/" replace />} />
                <Route path="/pos" element={<PosPage />} />
                <Route path="/sales/history" element={<SalesHistoryPage />} />
                <Route path="/sales/trend" element={<SalesAnalyticsPage />} />
                <Route path="/product" element={<ProductListPage />} />
                <Route path="/product/create" element={<ProductCreatePage />} />
                <Route path="/product/:productId/edit" element={<ProductEditPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            )}
          </main>
        </div>
      </CheckoutProvider>
    </ProductCatalogProvider>
  )
}

export default App
