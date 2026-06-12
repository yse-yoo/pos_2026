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
        <span className="text-xs text-emerald-600">
          {product.category}
        </span>
        <h2 className="my-2 text-base font-black text-gray-800">
          {product.name}
        </h2>
        <div>
          {soldOut && (
            <span className="rounded-full bg-red-400 text-white px-3 py-1 text-xs font-black">
              売り切れ中
            </span>
          )}
        </div>
        <strong className={`mt-auto font-mono text-lg font-black ${soldOut ? 'text-[#94a3b8]' : 'text-[var(--brand-dark)]'}`}>
          {formatCurrency(product.price)}
          （税抜）
        </strong>
      </div>
    </article>
  )
}
