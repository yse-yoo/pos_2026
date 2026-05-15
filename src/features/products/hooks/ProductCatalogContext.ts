import { createContext } from 'react'
import type {
  AdminProduct,
  ProductCategory,
  ProductCategoryName,
  ProductFormPayload,
  ProductStatusFilter,
} from '../../../types/product'
import type { mapAdminProductsToPosProducts } from '../../pos/model/mapAdminProductsToPosProducts'

export type ProductCatalogContextValue = {
  categories: ProductCategory[]
  products: AdminProduct[]
  filteredProducts: AdminProduct[]
  posProducts: ReturnType<typeof mapAdminProductsToPosProducts>
  categoryNameById: Map<number, ProductCategoryName>
  searchKeyword: string
  selectedCategoryId: string
  selectedStatus: ProductStatusFilter
  activeProductCount: number
  inactiveProductCount: number
  isLoading: boolean
  errorMessage: string | null
  reloadCatalog: () => Promise<void>
  setSearchKeyword: (value: string) => void
  setSelectedCategoryId: (value: string) => void
  setSelectedStatus: (value: ProductStatusFilter) => void
  createProduct: (payload: ProductFormPayload) => Promise<void>
  updateProduct: (productId: number, payload: ProductFormPayload) => Promise<void>
  reorderProducts: (orderedProductIds: number[]) => Promise<void>
  deleteProduct: (productId: number) => Promise<void>
  getProductById: (productId: number) => AdminProduct | null
}

export const ProductCatalogContext = createContext<ProductCatalogContextValue | null>(null)
