import { EmptyState } from '../../components/feedback/EmptyState'
import { CategoryTabs } from '../../pos/components/CategoryTabs'
import type { PosCategoryName, PosProduct } from '../../types/product'
import { CustomerMenuCard } from './CustomerMenuCard'

type CustomerMenuProductSectionProps = {
  categories: PosCategoryName[]
  selectedCategory: PosCategoryName
  products: PosProduct[]
  onSelectCategory: (category: PosCategoryName) => void
}

export function CustomerMenuProductSection({
  categories,
  selectedCategory,
  products,
  onSelectCategory,
}: CustomerMenuProductSectionProps) {
  return (
    <section className="customer-menu-body">
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />

      {products.length === 0 ? (
        <EmptyState
          icon="🍽️"
          title="表示できる商品がありません"
          description="カテゴリを変更して商品をご確認ください。"
        />
      ) : (
        <div className="customer-menu-grid" aria-label="商品メニュー">
          {products.map((product) => (
            <CustomerMenuCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
