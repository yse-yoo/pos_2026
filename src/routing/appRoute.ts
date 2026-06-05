import type { ViewName } from '../types/app-route'

export const getProductEditPath = (productId: number) => `/product/${productId}/edit`
export const productListPath = '/product'
export const productCreatePath = '/product/create'
export const customerMenuPath = '/'
export const posRegisterPath = '/pos'

export const getViewNameFromPath = (pathName: string): ViewName => {
  if (pathName.startsWith('/pos')) {
    return 'pos'
  }

  if (pathName.startsWith('/sales/trend')) {
    return 'analytics'
  }

  if (pathName.startsWith('/sales')) {
    return 'history'
  }

  if (pathName.startsWith('/product')) {
    return 'products'
  }

  return 'menu'
}
