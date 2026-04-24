import type { ProductCategory } from '../types/product'

export const productCategoriesFixture: ProductCategory[] = [
  { id: 1, name: 'フード', sortOrder: 10, isActive: true },
  { id: 2, name: 'ドリンク', sortOrder: 20, isActive: true },
  { id: 3, name: 'トッピング', sortOrder: 30, isActive: true },
  { id: 4, name: '有料袋', sortOrder: 40, isActive: true },
]
