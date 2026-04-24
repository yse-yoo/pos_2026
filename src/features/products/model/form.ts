import { productCategoriesFixture } from '../../../mocks/categories'
import type {
  AdminProduct,
  ProductFormErrors,
  ProductFormPayload,
  ProductFormState,
} from '../../../types/product'

export const createEmptyProductForm = (): ProductFormState => ({
  name: '',
  price: '',
  categoryId: String(productCategoriesFixture[0].id),
  icon: '',
  isActive: true,
  sortOrder: '0',
})

export const createProductFormFromItem = (item: AdminProduct): ProductFormState => ({
  name: item.name,
  price: String(item.price),
  categoryId: String(item.categoryId),
  icon: item.icon,
  isActive: item.isActive,
  sortOrder: String(item.sortOrder),
})

export const validateProductForm = (form: ProductFormState): {
  errors: ProductFormErrors
  payload?: ProductFormPayload
} => {
  const errors: ProductFormErrors = {}
  const normalizedName = form.name.trim()
  const normalizedPrice = Number(form.price)
  const normalizedCategoryId = Number(form.categoryId)
  const normalizedIcon = form.icon.trim()
  const normalizedSortOrder = Number(form.sortOrder)

  if (normalizedName.length === 0 || normalizedName.length > 50) {
    errors.name = '商品名は1〜50文字で入力してください。'
  }

  if (
    !Number.isInteger(normalizedPrice) ||
    normalizedPrice < 0 ||
    normalizedPrice > 999999
  ) {
    errors.price = '価格は0〜999999の整数で入力してください。'
  }

  if (!productCategoriesFixture.some((category) => category.id === normalizedCategoryId)) {
    errors.categoryId = 'カテゴリを選択してください。'
  }

  if (Array.from(normalizedIcon).length > 4) {
    errors.icon = 'アイコンは4文字以内で入力してください。'
  }

  if (!Number.isInteger(normalizedSortOrder) || normalizedSortOrder < 0) {
    errors.sortOrder = '並び順は0以上の整数で入力してください。'
  }

  if (Object.keys(errors).length > 0) {
    return { errors }
  }

  return {
    errors,
    payload: {
      name: normalizedName,
      price: normalizedPrice,
      categoryId: normalizedCategoryId,
      icon: normalizedIcon,
      isActive: form.isActive,
      sortOrder: normalizedSortOrder,
    },
  }
}
