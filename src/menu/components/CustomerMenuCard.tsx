import { buildAssetUrl } from '../../lib/api/client'
import { formatCurrency } from '../../lib/format/currency'
import type { PosProduct } from '../../types/product'

type CustomerMenuCardProps = {
  product: PosProduct
}

export function CustomerMenuCard({ product }: CustomerMenuCardProps) {
  const soldOut = !product.isActive

  return (
    <article className="grid grid-rows-[12rem_auto] overflow-hidden rounded-[1.1rem] border border-[#edf2ef] bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      {/* 画像エリア: grid-row 1 = 12rem 固定 */}
      <div className="relative flex items-center justify-center p-3">
        {product.imagePath ? (
          <img
            className="h-full w-full object-contain"
            src={buildAssetUrl(product.imagePath)}
            alt=""
          />
        ) : (
          <span className="text-5xl leading-none" aria-hidden="true">
            {product.icon}
          </span>
        )}
      </div>

      {/* テキストエリア: grid-row 2 = auto */}
      <div className="flex flex-col gap-2 border-t border-[#edf2ef] p-4">
        <span className="text-xs font-black text-[#64748b]">{product.category}</span>
        <h2 className="my-2 text-base font-black leading-[1.4] text-[#334155]">
          {product.name}
        </h2>
        <div>
          {soldOut && (
            <span className="bg-rose-500 px-2.5 py-1 border border-md text-xs font-black text-white">
              売り切れ中
            </span>
          )}
        </div>
        <strong className={`mt-auto font-mono text-lg font-black ${soldOut ? 'text-[#94a3b8]' : 'text-[var(--brand-dark)]'}`}>
          {formatCurrency(product.price)}
        </strong>
      </div>
    </article>
  )
}
