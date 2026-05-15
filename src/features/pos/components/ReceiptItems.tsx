import { formatCurrency } from '../../../lib/format/currency'
import type { CartItem } from '../../../types/product'

type ReceiptItemsProps = {
  items: CartItem[]
  onChangeQuantity: (productId: number, delta: number) => void
}

export function ReceiptItems({ items, onChangeQuantity }: ReceiptItemsProps) {
  return (
    <div className="receipt-items">
      {items.length === 0 ? (
        <div className="empty-cart">
          <p>No items selected</p>
        </div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="receipt-item">
            <span className="receipt-item-icon" aria-hidden="true">
              {item.icon}
            </span>

            <div className="receipt-item-body">
              <span className="receipt-item-name">{item.name}</span>
              <span className="receipt-item-unit">{formatCurrency(item.price)} / unit</span>
            </div>

            <div className="quantity-control" aria-label={`${item.name} の数量調整`}>
              <button type="button" onClick={() => onChangeQuantity(item.id, -1)}>
                −
              </button>
              <span>{item.quantity}</span>
              <button type="button" onClick={() => onChangeQuantity(item.id, 1)}>
                +
              </button>
            </div>

            <span className="receipt-item-total">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))
      )}
    </div>
  )
}
