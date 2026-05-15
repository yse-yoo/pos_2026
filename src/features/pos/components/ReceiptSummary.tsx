import { formatCurrency } from '../../../lib/format/currency'
import type { OrderType } from '../hooks/useCart'

type ReceiptSummaryProps = {
  orderType: OrderType
  taxRatePercent: number
  subtotal: number
  tax: number
  total: number
  onChangeOrderType: (orderType: OrderType) => void
}

export function ReceiptSummary({
  orderType,
  taxRatePercent,
  subtotal,
  tax,
  total,
  onChangeOrderType,
}: ReceiptSummaryProps) {
  return (
    <div className="receipt-summary">
      <div className="order-type-selector" aria-label="利用方法">
        <button
          type="button"
          className={orderType === 'dineIn' ? 'is-active' : ''}
          onClick={() => onChangeOrderType('dineIn')}
        >
          店内
        </button>
        <button
          type="button"
          className={orderType === 'takeout' ? 'is-active' : ''}
          onClick={() => onChangeOrderType('takeout')}
        >
          テイクアウト
        </button>
      </div>

      <div className="summary-row">
        <span>小計</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="summary-row summary-row-muted">
        <span>消費税 ({taxRatePercent}%)</span>
        <span>{formatCurrency(tax)}</span>
      </div>
      <div className="summary-total">
        <span>合計金額</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
    </div>
  )
}
