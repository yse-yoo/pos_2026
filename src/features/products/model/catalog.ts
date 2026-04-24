import type { AdminProduct, ProductStatusFilter } from '../../../types/product'

type ProductCatalogFilters = {
  searchKeyword: string
  selectedCategoryId: string
  selectedStatus: ProductStatusFilter
}

export const sortAdminProducts = (left: AdminProduct, right: AdminProduct) =>
  left.sortOrder - right.sortOrder || left.id - right.id

export const filterAdminProducts = (
  products: AdminProduct[],
  filters: ProductCatalogFilters,
) => {
  const normalizedKeyword = filters.searchKeyword.trim().toLowerCase()

  return products
    .filter((product) => {
      if (
        normalizedKeyword.length > 0 &&
        !product.name.toLowerCase().includes(normalizedKeyword)
      ) {
        return false
      }

      if (
        filters.selectedCategoryId !== 'all' &&
        product.categoryId !== Number(filters.selectedCategoryId)
      ) {
        return false
      }

      if (filters.selectedStatus === 'active' && !product.isActive) {
        return false
      }

      if (filters.selectedStatus === 'inactive' && product.isActive) {
        return false
      }

      return true
    })
    .sort(sortAdminProducts)
}

export const getNextProductId = (products: AdminProduct[]) =>
  products.reduce((maxId, product) => Math.max(maxId, product.id), 0) + 1
