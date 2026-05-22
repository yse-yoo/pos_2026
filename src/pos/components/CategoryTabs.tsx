import type { PosCategoryName } from '../../types/product'

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
    <div className="flex gap-3 flex-wrap" role="tablist" aria-label="商品カテゴリ">
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          className={`cursor-pointer transition-all duration-200 py-[0.7rem] px-5 rounded-[0.9rem] border text-[0.92rem] font-extrabold ${
            selectedCategory === category
              ? 'border-transparent bg-[var(--brand)] text-white shadow-[0_8px_18px_rgba(105,190,148,0.28)]'
              : 'border-transparent bg-[#f8faf9] text-slate-500 hover:border-[rgba(105,190,148,0.22)] hover:bg-[rgba(105,190,148,0.08)]'
          }`}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  )
}
