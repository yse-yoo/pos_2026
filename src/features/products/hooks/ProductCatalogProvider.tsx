import { useCallback, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import type { AdminProduct, ProductCategoryName, ProductFormPayload, ProductStatusFilter } from '../../../types/product'
import { mapAdminProductsToPosProducts } from '../../pos/model/mapAdminProductsToPosProducts'
import {
  createProduct as createProductRequest,
  deleteProduct as deleteProductRequest,
  listCategories,
  listProducts,
  updateProduct as updateProductRequest,
} from '../api/productCatalogRepository'
import { filterAdminProducts, sortAdminProducts } from '../model/catalog'
import { ProductCatalogContext } from './ProductCatalogContext'

export function ProductCatalogProvider({ children }: PropsWithChildren) {
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof listCategories>>>([])
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState<ProductStatusFilter>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const hasLoaded = useRef(false)

  const reloadCatalog = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const [nextCategories, nextProducts] = await Promise.all([
        listCategories(),
        listProducts(),
      ])

      setCategories(nextCategories)
      setProducts([...nextProducts].sort(sortAdminProducts))
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : '商品マスタの取得に失敗しました。',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (hasLoaded.current) {
      return
    }

    hasLoaded.current = true
    void reloadCatalog()
  }, [reloadCatalog])

  const categoryNameById = useMemo(
    () =>
      new Map<number, ProductCategoryName>(
        categories.map((category) => [category.id, category.name]),
      ),
    [categories],
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

  const createProduct = async (payload: ProductFormPayload) => {
    await createProductRequest(payload)
    await reloadCatalog()
  }

  const updateProduct = async (productId: number, payload: ProductFormPayload) => {
    await updateProductRequest(productId, payload)
    await reloadCatalog()
  }

  const deleteProduct = async (productId: number) => {
    await deleteProductRequest(productId)
    await reloadCatalog()
  }

  const getProductById = (productId: number) =>
    products.find((product) => product.id === productId) ?? null

  return (
    <ProductCatalogContext.Provider
      value={{
        categories,
        products,
        filteredProducts,
        posProducts,
        categoryNameById,
        searchKeyword,
        selectedCategoryId,
        selectedStatus,
        activeProductCount,
        inactiveProductCount: products.length - activeProductCount,
        isLoading,
        errorMessage,
        reloadCatalog,
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
