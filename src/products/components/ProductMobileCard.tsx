import { Button } from '../../components/actions/Button'
import { StatusChip } from '../../components/feedback/StatusChip'
import { buildAssetUrl } from '../../lib/api/client'
import { formatCurrency } from '../../lib/format/currency'
import type { AdminProduct } from '../../types/product'

type ProductMobileCardProps = {
  product: AdminProduct
  categoryName: string
  isStatusUpdating?: boolean
  onEditProduct: (productId: number) => void
  onDeleteProduct: (productId: number) => void
  onToggleStatus: (product: AdminProduct) => void
}

export function ProductMobileCard({
  product,
  categoryName,
  isStatusUpdating = false,
  onEditProduct,
  onDeleteProduct,
  onToggleStatus,
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
          <dt>販売状態</dt>
          <dd>
            <button
              type="button"
              className="status-toggle-button"
              onClick={() => onToggleStatus(product)}
              disabled={isStatusUpdating}
              aria-label={`${product.name}を${product.isActive ? '売り切れ' : '販売中'}に変更`}
            >
              <StatusChip tone={product.isActive ? 'active' : 'inactive'}>
                {isStatusUpdating ? '更新中...' : product.isActive ? '販売中' : '売り切れ'}
              </StatusChip>
            </button>
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
