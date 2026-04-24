export type ViewName = 'pos' | 'history' | 'products'

export type ProductScreen = 'list' | 'create' | 'edit'

export type AppRoute =
  | { view: 'pos' }
  | { view: 'history' }
  | { view: 'products'; screen: ProductScreen; productId?: number }
