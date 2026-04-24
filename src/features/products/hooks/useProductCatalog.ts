import { useContext } from 'react'
import { ProductCatalogContext } from './ProductCatalogContext'

export const useProductCatalog = () => {
  const context = useContext(ProductCatalogContext)

  if (!context) {
    throw new Error('useProductCatalog must be used within ProductCatalogProvider.')
  }

  return context
}
