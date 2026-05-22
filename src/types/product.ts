import type { CategoryName } from './category'

export type PosCategoryName = '全て' | CategoryName

export type StatusFilter = 'all' | 'active' | 'inactive'

export type AdminProduct = {
  id: number
  name: string
  price: number
  categoryId: number
  icon: string
  imagePath: string
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type PosProduct = {
  id: number
  name: string
  price: number
  category: CategoryName
  icon: string
  imagePath: string
}

export type CartItem = PosProduct & {
  quantity: number
}

export type FormState = {
  name: string
  price: string
  categoryId: string
  icon: string
  imagePath: string
  isActive: boolean
  sortOrder: string
}

export type FormField = keyof FormState

export type FormErrors = Partial<Record<FormField, string>>

export type Product = {
  name: string
  price: number
  categoryId: number
  icon: string
  imagePath: string
  isActive: boolean
  sortOrder: number
}
