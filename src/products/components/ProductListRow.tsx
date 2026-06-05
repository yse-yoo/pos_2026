import { Button } from '../../components/actions/Button'
import { StatusChip } from '../../components/feedback/StatusChip'
import { buildAssetUrl } from '../../lib/api/client'
import { formatCurrency } from '../../lib/format/currency'
import type { AdminProduct } from '../../types/product'

type ProductListRowProps = {
  product: AdminProduct
  categoryName: string
  isSortMode?: boolean
  isDragging?: boolean
  isStatusUpdating?: boolean
  onEditProduct: (productId: number) => void
  onDeleteProduct: (productId: number) => void
  onToggleStatus?: (product: AdminProduct) => void
  onDragStart?: (productId: number) => void
  onDragEnter?: (productId: number) => void
  onDragEnd?: () => void
}

export function ProductListRow({
  product,
  categoryName,
  isSortMode = false,
  isDragging = false,
  isStatusUpdating = false,
  onEditProduct,
  onDeleteProduct,
  onToggleStatus,
  onDragStart,
  onDragEnter,
  onDragEnd,
}: ProductListRowProps) {
  const statusChip = (
    <StatusChip tone={product.isActive ? 'active' : 'inactive'}>
      {isStatusUpdating ? '更新中...' : product.isActive ? '販売中' : '売り切れ'}
    </StatusChip>
  )

  return (
    <div
      className={`admin-product-row${isSortMode ? ' is-sortable' : ''}${isDragging ? ' is-dragging' : ''}`}
      role="row"
      draggable={isSortMode}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'move'
        onDragStart?.(product.id)
      }}
      onDragEnter={() => onDragEnter?.(product.id)}
      onDragOver={(event) => {
        if (isSortMode) {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'move'
        }
      }}
      onDrop={(event) => {
        if (isSortMode) {
          event.preventDefault()
        }
      }}
      onDragEnd={onDragEnd}
    >
      <div className="admin-product-cell" role="cell">
        {product.id}
      </div>
      <div className="admin-product-cell admin-name-cell" role="cell">
        {product.name}
      </div>
      <div className="admin-product-cell admin-price-cell" role="cell">
        {formatCurrency(product.price)}
      </div>
      <div className="admin-product-cell" role="cell">
        {categoryName}
      </div>
      <div className="admin-product-cell" role="cell">
        <span className="admin-icon-badge">{product.icon || '・'}</span>
      </div>
      <div className="admin-product-cell" role="cell">
        {product.imagePath ? (
          <img className="admin-product-thumb" src={buildAssetUrl(product.imagePath)} alt="" />
        ) : (
          <span className="admin-image-placeholder">なし</span>
        )}
      </div>
      <div className="admin-product-cell" role="cell">
        {onToggleStatus ? (
          <button
            type="button"
            className="status-toggle-button"
            onClick={() => onToggleStatus(product)}
            disabled={isStatusUpdating}
            aria-label={`${product.name}を${product.isActive ? '売り切れ' : '販売中'}に変更`}
          >
            {statusChip}
          </button>
        ) : statusChip}
      </div>
      <div className="admin-product-cell" role="cell">
        <StatusChip mono>{product.sortOrder}</StatusChip>
      </div>
      <div className="admin-product-cell" role="cell">
        {isSortMode ? (
          <span className="admin-drag-handle" aria-hidden="true">ドラッグ</span>
        ) : (
          <div className="admin-row-actions">
            <Button
              variant="secondary"
              className="row-action-button"
              onClick={() => onEditProduct(product.id)}
            >
              編集
            </Button>
            <Button
              variant="danger"
              className="row-action-button"
              onClick={() => onDeleteProduct(product.id)}
            >
              削除
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
