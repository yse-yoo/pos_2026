import { useNavigate, useParams } from 'react-router-dom'
import { productListPath } from '../routing/appRoute'
import { ProductFormPage } from './ProductFormPage'

export function ProductCreatePage() {
  const navigate = useNavigate()

  return (
    <ProductFormPage
      key="create-new"
      mode="create"
      onBack={() => navigate(productListPath)}
    />
  )
}

export function ProductEditPage() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const parsedProductId = productId ? Number(productId) : undefined

  return (
    <ProductFormPage
      key={`edit-${parsedProductId ?? 'missing'}`}
      mode="edit"
      productId={parsedProductId}
      onBack={() => navigate(productListPath)}
    />
  )
}
