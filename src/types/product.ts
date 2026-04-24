export type ProductCategoryName = 'フード' | 'ドリンク' | 'トッピング' | '有料袋'

export type PosCategoryName = '全て' | ProductCategoryName

export type ProductStatusFilter = 'all' | 'active' | 'inactive'

export type ProductCategory = {
  id: number
  name: ProductCategoryName
  sortOrder: number
  isActive: boolean
}

export type AdminProduct = {
  id: number
  name: string
  price: number
  categoryId: number
  icon: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type PosProduct = {
  id: number
  name: string
  price: number
  category: ProductCategoryName
  icon: string
}

export type CartItem = PosProduct & {
  quantity: number
}

export type ProductFormState = {
  name: string
  price: string
  categoryId: string
  icon: string
  isActive: boolean
  sortOrder: string
}

export type ProductFormField = keyof ProductFormState

export type ProductFormErrors = Partial<Record<ProductFormField, string>>

export type ProductFormPayload = {
  name: string
  price: number
  categoryId: number
  icon: string
  isActive: boolean
  sortOrder: number
}
