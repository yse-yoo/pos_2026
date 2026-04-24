import { useMemo, useState, type PropsWithChildren } from 'react'
import { productCategoriesFixture } from '../../../mocks/categories'
import { productCatalogFixture } from '../../../mocks/products'
import type { AdminProduct, ProductCategoryName, ProductFormPayload, ProductStatusFilter } from '../../../types/product'
import { mapAdminProductsToPosProducts } from '../../pos/model/mapAdminProductsToPosProducts'
import { filterAdminProducts, getNextProductId, sortAdminProducts } from '../model/catalog'
import { ProductCatalogContext } from './ProductCatalogContext'

export function ProductCatalogProvider({ children }: PropsWithChildren) {
  const [products, setProducts] = useState<AdminProduct[]>(() =>
    [...productCatalogFixture].sort(sortAdminProducts),
  )
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState<ProductStatusFilter>('all')

  const categoryNameById = useMemo(
    () =>
      new Map<number, ProductCategoryName>(
        productCategoriesFixture.map((category) => [category.id, category.name]),
      ),
    [],
  )

  const filteredProducts = useMemo(
    () =>
      filterAdminProducts(products, {
        searchKeyword,
        selectedCategoryId,
        selectedStatus,
      }),
    [products, searchKeyword, selectedCategoryId, selectedStatus],
  )

  const posProducts = useMemo(
    () => mapAdminProductsToPosProducts(products, categoryNameById),
    [products, categoryNameById],
  )

  const activeProductCount = useMemo(
    () => products.filter((product) => product.isActive).length,
    [products],
  )

  const createProduct = (payload: ProductFormPayload) => {
    const now = new Date().toISOString()

    setProducts((currentProducts) =>
      [
        ...currentProducts,
        {
          id: getNextProductId(currentProducts),
          ...payload,
          createdAt: now,
          updatedAt: now,
        },
      ].sort(sortAdminProducts),
    )
  }

  const updateProduct = (productId: number, payload: ProductFormPayload) => {
    const now = new Date().toISOString()

    setProducts((currentProducts) =>
      currentProducts
        .map((product) =>
          product.id === productId ? { ...product, ...payload, updatedAt: now } : product,
        )
        .sort(sortAdminProducts),
    )
  }

  const deleteProduct = (productId: number) => {
    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== productId).sort(sortAdminProducts),
    )
  }

  const getProductById = (productId: number) =>
    products.find((product) => product.id === productId) ?? null

  return (
    <ProductCatalogContext.Provider
      value={{
        categories: productCategoriesFixture,
        products,
        filteredProducts,
        posProducts,
        categoryNameById,
        searchKeyword,
        selectedCategoryId,
        selectedStatus,
        activeProductCount,
        inactiveProductCount: products.length - activeProductCount,
        setSearchKeyword,
        setSelectedCategoryId,
        setSelectedStatus,
        createProduct,
        updateProduct,
        deleteProduct,
        getProductById,
      }}
    >
      {children}
    </ProductCatalogContext.Provider>
  )
}
