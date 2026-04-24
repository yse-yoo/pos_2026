import type { AppRoute } from '../../types/app-route'
import { ProductFormPage } from './ProductFormPage'
import { ProductListPage } from './ProductListPage'

type ProductsPageProps = {
  route: Extract<AppRoute, { view: 'products' }>
  onNavigate: (route: AppRoute) => void
}

export function ProductsPage({ route, onNavigate }: ProductsPageProps) {
  if (route.screen === 'list') {
    return <ProductListPage onNavigate={onNavigate} />
  }

  return (
    <ProductFormPage
      key={`${route.screen}-${route.productId ?? 'new'}`}
      mode={route.screen}
      productId={route.productId}
      onBack={() => onNavigate({ view: 'products', screen: 'list' })}
    />
  )
}
