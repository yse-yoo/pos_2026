import { buildAssetUrl } from '../../lib/api/client'
import { formatCurrency } from '../../lib/format/currency'
import { useProductCatalog } from '../../products/hooks/useProductCatalog'
import type { CartItem } from '../../types/product'

type OrderDraftItemsProps = {
  items: CartItem[]
}

export function OrderDraftItems({ items }: OrderDraftItemsProps) {
  const { posProducts } = useProductCatalog()
  const productById = Object.fromEntries(posProducts.map((p) => [p.id, p]))

  if (items.length === 0) {
    return (
      <p className="py-2 text-sm text-[#94a3b8]">まだ商品が追加されていません。</p>
    )
  }

  return (
    <div className="grid gap-2">
      {items.map((item) => {
        const product = productById[item.id]
        const imagePath = product?.imagePath || item.imagePath
        const icon = product?.icon || item.icon

        return (
        <div
          key={item.id}
          className="flex items-center gap-3 rounded-xl border border-[#edf2ef] bg-[#f8faf9] p-3"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
            {imagePath ? (
              <img
                className="h-full w-full object-contain"
                src={buildAssetUrl(imagePath)}
                alt=""
              />
            ) : (
              <span className="text-2xl" aria-hidden="true">
                {icon}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[#334155]">{item.name}</p>
            <p className="text-xs text-[#94a3b8]">{formatCurrency(item.price)} / 個</p>
          </div>

          <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
            x {item.quantity}
          </span>

          <span className="shrink-0 font-mono text-sm font-black text-[var(--brand-dark)]">
            {formatCurrency(item.price * item.quantity)}
          </span>
        </div>
        )
      })}
    </div>
  )
}
