import { buildAssetUrl } from '../../lib/api/client'
import { formatCurrency } from '../../lib/format/currency'
import type { PosProduct } from '../../types/product'

type ProductGridProps = {
  products: PosProduct[]
  onAddItem: (product: PosProduct) => void
}

export function ProductGrid({ products, onAddItem }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 max-[900px]:grid-cols-1 gap-1 overflow-y-auto">
      {products.map((product) => (
        <button
          key={product.id}
          type="button"
          className="flex flex-col items-center gap-3 p-4 border border-[#edf2ef] rounded-2xl bg-white text-center cursor-pointer transition-all duration-200 hover:border-[rgba(105,190,148,0.42)] hover:bg-[rgba(105,190,148,0.05)] hover:-translate-y-px disabled:cursor-not-allowed disabled:bg-[#f8faf9] disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:border-[#edf2ef]"
          disabled={!product.isActive}
          onClick={() => onAddItem(product)}
        >
          {product.imagePath ? (
            <img
              className="w-[4.25rem] h-[4.25rem] rounded-[0.85rem] object-cover bg-[#f8faf9]"
              src={buildAssetUrl(product.imagePath)}
              alt=""
            />
          ) : (
            <span className="text-[2rem] leading-none" aria-hidden="true">
              {product.icon}
            </span>
          )}
          <span className="w-full text-[#334155] text-[0.94rem] font-extrabold leading-[1.4]">
            {product.name}
          </span>
          <span className="text-[var(--brand-dark)] text-base font-black">
            {formatCurrency(product.price)}
          </span>
          {!product.isActive ? (
            <span className="rounded-full bg-red-500 text-white px-3 py-1 text-xs font-black">
              売り切れ中
            </span>
          ) : null}
        </button>
      ))}
    </div>
  )
}
