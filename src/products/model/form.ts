import type { Category } from '../../types/category'
import type {
  AdminProduct,
  FormErrors,
  Product,
  FormState,
} from '../../types/product'

export const createEmptyProductForm = (categories: Category[] = []): FormState => ({
  name: '',
  price: '',
  categoryId: categories[0] ? String(categories[0].id) : '',
  icon: '',
  imagePath: '',
  isActive: true,
  sortOrder: '0',
})

export const createProductFormFromItem = (item: AdminProduct): FormState => ({
  name: item.name,
  price: String(item.price),
  categoryId: String(item.categoryId),
  icon: item.icon,
  imagePath: item.imagePath,
  isActive: item.isActive,
  sortOrder: String(item.sortOrder),
})

export const validateProductForm = (
  form: FormState,
  categories: Category[],
): {
  errors: FormErrors
  payload?: Product
} => {
  const errors: FormErrors = {}
  const normalizedName = form.name.trim()
  const normalizedPrice = Number(form.price)
  const normalizedCategoryId = Number(form.categoryId)
  const normalizedIcon = form.icon.trim()
  const normalizedImagePath = form.imagePath.trim()
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

  if (!categories.some((category) => category.id === normalizedCategoryId)) {
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
      imagePath: normalizedImagePath,
      isActive: form.isActive,
      sortOrder: normalizedSortOrder,
    },
  }
}
