import type { PosCategoryName, PosProduct } from '../../../types/product'
import { CategoryTabs } from './CategoryTabs'
import { ProductGrid } from './ProductGrid'

type ProductPanelProps = {
  categories: PosCategoryName[]
  selectedCategory: PosCategoryName
  products: PosProduct[]
  onSelectCategory: (category: PosCategoryName) => void
  onAddItem: (product: PosProduct) => void
}

export function ProductPanel({
  categories,
  selectedCategory,
  products,
  onSelectCategory,
  onAddItem,
}: ProductPanelProps) {
  return (
    <section className="page-panel product-panel">
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />
      <ProductGrid products={products} onAddItem={onAddItem} />
    </section>
  )
}
