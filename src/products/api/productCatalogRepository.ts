import { apiRequest } from '../../lib/api/client'
import type { Category, CategoryName } from '../../types/category'
import type { AdminProduct, Product } from '../../types/product'

type CategoryResource = {
  id: number
  name: string
  display_order: number
  is_active: number | boolean
}

type ProductResource = {
  id: number
  category_id: number | null
  name: string
  price: number
  icon: string | null
  image_path: string | null
  is_active: number | boolean
  display_order: number
  created_at: string
  updated_at: string
}

const mapCategory = (category: CategoryResource): Category => ({
  id: Number(category.id),
  name: category.name as CategoryName,
  sortOrder: Number(category.display_order),
  isActive: Boolean(Number(category.is_active)),
})

const mapProduct = (product: ProductResource): AdminProduct => ({
  id: Number(product.id),
  name: product.name,
  price: Number(product.price),
  categoryId: product.category_id === null ? 0 : Number(product.category_id),
  icon: product.icon ?? '',
  imagePath: product.image_path ?? '',
  isActive: Boolean(Number(product.is_active)),
  sortOrder: Number(product.display_order),
  createdAt: product.created_at,
  updatedAt: product.updated_at,
})

const toProductRequestBody = (payload: Product) => ({
  category_id: payload.categoryId,
  name: payload.name,
  price: payload.price,
  tax_rate: 10,
  tax_type: 'standard',
  icon: payload.icon,
  image_path: payload.imagePath,
  stock_quantity: null,
  is_active: payload.isActive,
  display_order: payload.sortOrder,
})

export const listCategories = async (): Promise<Category[]> => {
  const categories = await apiRequest<CategoryResource[]>('/api/categories?include_inactive=1')
  return categories.map(mapCategory)
}

export const listProducts = async (): Promise<AdminProduct[]> => {
  const products = await apiRequest<ProductResource[]>('/api/products?include_inactive=1')
  return products.map(mapProduct)
}

export const createProduct = async (payload: Product): Promise<void> => {
  await apiRequest('/api/products', {
    method: 'POST',
    body: JSON.stringify(toProductRequestBody(payload)),
  })
}

export const uploadProductImage = async (imageFile: File): Promise<string> => {
  const body = new FormData()
  body.append('image', imageFile)

  const response = await apiRequest<{ image_path: string }>('/api/product-images', {
    method: 'POST',
    body,
  })

  return response.image_path
}

export const updateProduct = async (
  productId: number,
  payload: Product,
): Promise<void> => {
  await apiRequest(`/api/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(toProductRequestBody(payload)),
  })
}

export const deleteProduct = async (productId: number): Promise<void> => {
  await apiRequest(`/api/products/${productId}`, {
    method: 'DELETE',
  })
}
