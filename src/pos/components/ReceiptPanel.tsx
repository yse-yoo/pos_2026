import { ErrorBanner } from '../../components/feedback/ErrorBanner'
import { formatReceiptNumber } from '../../lib/format/receipt'
import type { CartItem } from '../../types/product'
import type { OrderType, PaymentMethod } from '../hooks/useCart'
import { ReceiptActions } from './ReceiptActions'
import { ReceiptItems } from './ReceiptItems'
import { ReceiptSummary } from './ReceiptSummary'

type ReceiptPanelProps = {
  items: CartItem[]
  receiptNumber: number
  orderType: OrderType
  taxRatePercent: number
  subtotal: number
  tax: number
  total: number
  isAwaitingPayment: boolean
  paymentErrorMessage: string | null
  onChangeQuantity: (productId: number, delta: number) => void
  onChangeOrderType: (orderType: OrderType) => void
  onClearOrder: () => void
  onRequestPayment: (method: PaymentMethod) => Promise<void>
}

export function ReceiptPanel({
  items,
  receiptNumber,
  orderType,
  taxRatePercent,
  subtotal,
  tax,
  total,
  isAwaitingPayment,
  paymentErrorMessage,
  onChangeQuantity,
  onChangeOrderType,
  onClearOrder,
  onRequestPayment,
}: ReceiptPanelProps) {
  const hasItems = items.length > 0

  return (
    <aside className="page-panel receipt-panel">
      <div className="receipt-header">
        <h2>注文内容</h2>
        <span className="receipt-number">{formatReceiptNumber(receiptNumber)}</span>
      </div>

      {paymentErrorMessage ? (
        <ErrorBanner title="会計登録に失敗しました" message={paymentErrorMessage} />
      ) : null}

      <ReceiptItems items={items} onChangeQuantity={onChangeQuantity} />
      <ReceiptSummary
        orderType={orderType}
        taxRatePercent={taxRatePercent}
        subtotal={subtotal}
        tax={tax}
        total={total}
        onChangeOrderType={onChangeOrderType}
      />
      <ReceiptActions
        hasItems={hasItems}
        receiptNumber={receiptNumber}
        isAwaitingPayment={isAwaitingPayment}
        onClearOrder={onClearOrder}
        onRequestPayment={onRequestPayment}
      />
    </aside>
  )
}
