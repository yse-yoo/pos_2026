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
    <section className="bg-white rounded-3xl p-6 max-[640px]:p-4 flex flex-col gap-6">
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />
      <ProductGrid products={products} onAddItem={onAddItem} />
    </section>
  )
}
