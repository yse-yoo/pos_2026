import { Button } from '../../components/actions/Button'
import { StatusChip } from '../../components/feedback/StatusChip'
import { buildAssetUrl } from '../../lib/api/client'
import { formatCurrency } from '../../lib/format/currency'
import type { AdminProduct } from '../../types/product'

type ProductMobileCardProps = {
  product: AdminProduct
  categoryName: string
  onEditProduct: (productId: number) => void
  onDeleteProduct: (productId: number) => void
}

export function ProductMobileCard({
  product,
  categoryName,
  onEditProduct,
  onDeleteProduct,
}: ProductMobileCardProps) {
  return (
    <article className="admin-mobile-card">
      <div className="admin-mobile-head">
        <div>
          <span className="admin-mobile-id">ID {product.id}</span>
          <strong>{product.name}</strong>
        </div>
        {product.imagePath ? (
          <img className="admin-product-thumb" src={buildAssetUrl(product.imagePath)} alt="" />
        ) : (
          <span className="admin-icon-badge">{product.icon || '・'}</span>
        )}
      </div>

      <dl className="admin-mobile-details">
        <div className="admin-mobile-detail-row">
          <dt>価格</dt>
          <dd>{formatCurrency(product.price)}</dd>
        </div>
        <div className="admin-mobile-detail-row">
          <dt>カテゴリ</dt>
          <dd>{categoryName}</dd>
        </div>
        <div className="admin-mobile-detail-row">
          <dt>表示状態</dt>
          <dd>
            <StatusChip tone={product.isActive ? 'active' : 'inactive'}>
              {product.isActive ? '表示中' : '非表示'}
            </StatusChip>
          </dd>
        </div>
        <div className="admin-mobile-detail-row">
          <dt>並び順</dt>
          <dd>{product.sortOrder}</dd>
        </div>
      </dl>

      <div className="admin-mobile-actions">
        <Button variant="secondary" onClick={() => onEditProduct(product.id)}>
          編集
        </Button>
        <Button variant="danger" onClick={() => onDeleteProduct(product.id)}>
          削除
        </Button>
      </div>
    </article>
  )
}
