import { createContext } from 'react'
import type { Category, CategoryName } from '../../../types/category'
import type { AdminProduct, Product, StatusFilter } from '../../../types/product'
import type { mapAdminProductsToPosProducts } from '../../pos/model/mapAdminProductsToPosProducts'

export type ProductCatalogContextValue = {
  categories: Category[]
  products: AdminProduct[]
  filteredProducts: AdminProduct[]
  posProducts: ReturnType<typeof mapAdminProductsToPosProducts>
  categoryNameById: Map<number, CategoryName>
  searchKeyword: string
  selectedCategoryId: string
  selectedStatus: StatusFilter
  activeProductCount: number
  inactiveProductCount: number
  isLoading: boolean
  errorMessage: string | null
  reloadCatalog: () => Promise<void>
  setSearchKeyword: (value: string) => void
  setSelectedCategoryId: (value: string) => void
  setSelectedStatus: (value: StatusFilter) => void
  createProduct: (payload: Product) => Promise<void>
  updateProduct: (productId: number, payload: Product) => Promise<void>
  reorderProducts: (orderedProductIds: number[]) => Promise<void>
  deleteProduct: (productId: number) => Promise<void>
  getProductById: (productId: number) => AdminProduct | null
}

export const ProductCatalogContext = createContext<ProductCatalogContextValue | null>(null)
