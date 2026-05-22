import './App.css'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppHeader } from './components/layout/AppHeader'
import { AdminLoginPage } from './auth/components/AdminLoginPage'
import { AuthProvider } from './auth/hooks/AuthProvider'
import { useAuth } from './auth/hooks/useAuth'
import { getViewNameFromPath } from './routing/appRoute'
import { PosPage } from './pos/PosPage'
import { ProductCreatePage, ProductEditPage } from './products/ProductFormRoutes'
import { ProductCatalogProvider } from './products/hooks/ProductCatalogProvider'
import { ProductListPage } from './products/ProductListPage'
import { SalesHistoryPage } from './sales-history/SalesHistoryPage'

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
  const isAdminRoute = activeView === 'history' || activeView === 'products'

  return (
    <ProductCatalogProvider>
      <div className="app-shell">
        <AppHeader
          activeView={activeView}
          staffName={staff?.name ?? null}
          onLogout={() => void logout()}
        />

        <main className="app-main">
          {isAdminRoute && !staff ? (
            <AdminLoginPage />
          ) : (
            <Routes>
              <Route path="/" element={<PosPage />} />
              <Route path="/pos" element={<Navigate to="/" replace />} />
              <Route path="/sales/history" element={<SalesHistoryPage />} />
              <Route path="/product" element={<ProductListPage />} />
              <Route path="/product/create" element={<ProductCreatePage />} />
              <Route path="/product/:productId/edit" element={<ProductEditPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>
      </div>
    </ProductCatalogProvider>
  )
}

export default App
