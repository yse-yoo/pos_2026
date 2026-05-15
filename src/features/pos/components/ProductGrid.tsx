import { buildAssetUrl } from '../../../lib/api/client'
import { formatCurrency } from '../../../lib/format/currency'
import type { PosProduct } from '../../../types/product'

type ProductGridProps = {
  products: PosProduct[]
  onAddItem: (product: PosProduct) => void
}

export function ProductGrid({ products, onAddItem }: ProductGridProps) {
  return (
    <div className="product-grid">
      {products.map((product) => (
        <button
          key={product.id}
          type="button"
          className="product-card"
          onClick={() => onAddItem(product)}
        >
          {product.imagePath ? (
            <img className="product-image" src={buildAssetUrl(product.imagePath)} alt="" />
          ) : (
            <span className="product-icon" aria-hidden="true">
              {product.icon}
            </span>
          )}
          <span className="product-name">{product.name}</span>
          <span className="product-price">{formatCurrency(product.price)}</span>
        </button>
      ))}
    </div>
  )
}
