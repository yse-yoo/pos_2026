import './App.css'
import { AppHeader } from './components/layout/AppHeader'
import { AdminLoginPage } from './auth/components/AdminLoginPage'
import { AuthProvider } from './auth/hooks/AuthProvider'
import { useAuth } from './auth/hooks/useAuth'
import { useAppRoute } from './hooks/useAppRoute'
import { routeToViewName } from './lib/routing/appRoute'
import { PosPage } from './pos/PosPage'
import { ProductCatalogProvider } from './products/hooks/ProductCatalogProvider'
import { ProductsPage } from './products/ProductsPage'
import { SalesHistoryPage } from './sales-history/SalesHistoryPage'

function App() {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  )
}

function AuthenticatedApp() {
  const { route, navigateToRoute, navigateToView } = useAppRoute()
  const { staff, logout } = useAuth()
  const isAdminRoute = route.view === 'history' || route.view === 'products'

  return (
    <ProductCatalogProvider>
      <div className="app-shell">
        <AppHeader
          activeView={routeToViewName(route)}
          staffName={staff?.name ?? null}
          onViewChange={navigateToView}
          onLogout={() => void logout()}
        />

        <main className="app-main">
          {route.view === 'pos' ? (
            <PosPage />
          ) : isAdminRoute && !staff ? (
            <AdminLoginPage />
          ) : route.view === 'history' ? (
            <SalesHistoryPage />
          ) : (
            <ProductsPage route={route} onNavigate={navigateToRoute} />
          )}
        </main>
      </div>
    </ProductCatalogProvider>
  )
}

export default App
