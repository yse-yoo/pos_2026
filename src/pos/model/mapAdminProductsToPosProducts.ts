import type { CategoryName } from '../../types/category'
import type { AdminProduct, PosProduct } from '../../types/product'

export const mapAdminProductsToPosProducts = (
  products: AdminProduct[],
  categoryNameById: Map<number, CategoryName>,
) =>
  products
    .filter((product) => product.isActive)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.id - right.id)
    .map<PosProduct>((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: categoryNameById.get(product.categoryId) ?? 'フード',
      icon: product.icon || '・',
      imagePath: product.imagePath,
    }))
