import type { PosCategoryName } from '../../../types/product'

type CategoryTabsProps = {
  categories: PosCategoryName[]
  selectedCategory: PosCategoryName
  onSelectCategory: (category: PosCategoryName) => void
}

export function CategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryTabsProps) {
  return (
    <div className="category-tabs" role="tablist" aria-label="商品カテゴリ">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={`category-tab${selectedCategory === category ? ' is-active' : ''}`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
