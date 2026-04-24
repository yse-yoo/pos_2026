import type { AppRoute, ViewName } from '../../types/app-route'

export const getProductEditPath = (productId: number) => `/products/${productId}/edit`

export const getPathForRoute = (route: AppRoute) => {
  if (route.view === 'pos') {
    return '/pos'
  }

  if (route.view === 'history') {
    return '/sales/history'
  }

  if (route.screen === 'create') {
    return '/products/create'
  }

  if (route.screen === 'edit' && typeof route.productId === 'number') {
    return getProductEditPath(route.productId)
  }

  return '/products'
}

export const resolveRouteFromPath = (pathName: string): AppRoute => {
  if (pathName === '/pos') {
    return { view: 'pos' }
  }

  if (pathName === '/products/create') {
    return { view: 'products', screen: 'create' }
  }

  const editMatch = pathName.match(/^\/products\/(\d+)\/edit$/)
  if (editMatch) {
    return {
      view: 'products',
      screen: 'edit',
      productId: Number(editMatch[1]),
    }
  }

  if (pathName.startsWith('/products')) {
    return { view: 'products', screen: 'list' }
  }

  return { view: 'history' }
}

export const routeToViewName = (route: AppRoute): ViewName => route.view
