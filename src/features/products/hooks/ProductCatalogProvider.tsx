import { useEffect, useRef, useState, type PropsWithChildren } from 'react'
import type { CategoryName } from '../../../types/category'
import type { AdminProduct, Product, StatusFilter } from '../../../types/product'
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
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const hasLoaded = useRef(false)

  const reloadCatalog = async () => {
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
  }

  useEffect(() => {
    if (hasLoaded.current) {
      return
    }

    hasLoaded.current = true
    void reloadCatalog()
  }, [reloadCatalog])

  const categoryNameById = new Map<number, CategoryName>(
    categories.map((category) => [category.id, category.name]),
  )

  const filteredProducts = filterAdminProducts(products, {
    searchKeyword,
    selectedCategoryId,
    selectedStatus,
  })

  const posProducts = mapAdminProductsToPosProducts(products, categoryNameById)

  const activeProductCount = products.filter((product) => product.isActive).length

  const createProduct = async (payload: Product) => {
    await createProductRequest(payload)
    await reloadCatalog()
  }

  const updateProduct = async (productId: number, payload: Product) => {
    await updateProductRequest(productId, payload)
    await reloadCatalog()
  }

  const reorderProducts = async (orderedProductIds: number[]) => {
    const productById = new Map(products.map((product) => [product.id, product]))

    await Promise.all(
      orderedProductIds.map((productId, index) => {
        const product = productById.get(productId)
        if (!product) {
          return Promise.resolve()
        }

        return updateProductRequest(product.id, {
          name: product.name,
          price: product.price,
          categoryId: product.categoryId,
          icon: product.icon,
          imagePath: product.imagePath,
          isActive: product.isActive,
          sortOrder: (index + 1) * 10,
        })
      }),
    )

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
        reorderProducts,
        deleteProduct,
        getProductById,
      }}
    >
      {children}
    </ProductCatalogContext.Provider>
  )
}
