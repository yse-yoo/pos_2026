import { Button } from '../../../components/actions/Button'
import type { PaymentMethod } from '../hooks/useCart'

type ReceiptActionsProps = {
  hasItems: boolean
  isCompletingPayment: boolean
  onClearOrder: () => void
  onCompletePayment: (method: PaymentMethod) => Promise<void>
}

export function ReceiptActions({
  hasItems,
  isCompletingPayment,
  onClearOrder,
  onCompletePayment,
}: ReceiptActionsProps) {
  const isDisabled = !hasItems || isCompletingPayment

  return (
    <div className="receipt-actions">
      <Button variant="ghost" onClick={onClearOrder} disabled={!hasItems}>
        クリア
      </Button>
      <Button
        variant="secondary"
        onClick={() => void onCompletePayment('cash')}
        disabled={isDisabled}
      >
        現金
      </Button>
      <Button
        variant="secondary"
        onClick={() => void onCompletePayment('card')}
        disabled={isDisabled}
      >
        カード
      </Button>
      <Button
        variant="primary"
        onClick={() => void onCompletePayment('cash')}
        disabled={isDisabled}
      >
        {isCompletingPayment ? '登録中...' : '会計確定'}
      </Button>
    </div>
  )
}
