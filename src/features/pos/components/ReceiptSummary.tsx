import { formatCurrency } from '../../../lib/format/currency'

type ReceiptSummaryProps = {
  subtotal: number
  tax: number
  total: number
}

export function ReceiptSummary({ subtotal, tax, total }: ReceiptSummaryProps) {
  return (
    <div className="receipt-summary">
      <div className="summary-row">
        <span>小計</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>
      <div className="summary-row summary-row-muted">
        <span>消費税 (10%)</span>
        <span>{formatCurrency(tax)}</span>
      </div>
      <div className="summary-total">
        <span>合計金額</span>
        <strong>{formatCurrency(total)}</strong>
      </div>
    </div>
  )
}
