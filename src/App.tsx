import './App.css'
import { AppHeader } from './components/layout/AppHeader'
import { useAppRoute } from './hooks/useAppRoute'
import { routeToViewName } from './lib/routing/appRoute'
import { PosPage } from './features/pos/PosPage'
import { ProductCatalogProvider } from './features/products/hooks/ProductCatalogProvider'
import { ProductsPage } from './features/products/ProductsPage'
import { SalesHistoryPage } from './features/sales-history/SalesHistoryPage'

function App() {
  const { route, navigateToRoute, navigateToView } = useAppRoute()

  return (
    <ProductCatalogProvider>
      <div className="app-shell">
        <AppHeader activeView={routeToViewName(route)} onViewChange={navigateToView} />

        <main className="app-main">
          {route.view === 'pos' ? (
            <PosPage />
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
