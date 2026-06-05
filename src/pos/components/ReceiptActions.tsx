import { useState } from 'react'
import { Button } from '../../components/actions/Button'
import type { PaymentMethod } from '../hooks/useCart'

type PaymentDialog = 'method' | 'requested' | null

type ReceiptActionsProps = {
  hasItems: boolean
  receiptNumber: number
  isAwaitingPayment: boolean
  onClearOrder: () => void
  onRequestPayment: (method: PaymentMethod) => Promise<void>
}

export function ReceiptActions({
  hasItems,
  isAwaitingPayment,
  onClearOrder,
  onRequestPayment,
}: ReceiptActionsProps) {
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialog>(null)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [isRequestingPayment, setIsRequestingPayment] = useState(false)
  const isPaymentLocked = isAwaitingPayment || isRequestingPayment
  const isDisabled = !hasItems || isPaymentLocked

  const paymentMethodLabels: Record<PaymentMethod, string> = {
    cash: '現金',
    qr: 'QR',
    other: '交通系',
    card: 'クレジット',
    square: 'カード',
  }

  const closeDialog = () => {
    if (!isPaymentLocked) {
      setSelectedMethod(null)
      setPaymentDialog(null)
    }
  }

  const closeRequestedDialog = () => {
    setPaymentDialog(null)
  }

  const requestPayment = async () => {
    if (!selectedMethod) {
      return
    }

    setIsRequestingPayment(true)

    try {
      await onRequestPayment(selectedMethod)
      setPaymentDialog('requested')
    } finally {
      setIsRequestingPayment(false)
    }
  }

  return (
    <>
      <div className="receipt-actions">
        <Button className="px-4 py-4" variant="ghost" onClick={onClearOrder} disabled={!hasItems || isPaymentLocked}>
          クリア
        </Button>
        <Button
          variant="primary"
          className="px-4 py-4 receipt-confirm-button"
          onClick={() => setPaymentDialog('method')}
          disabled={isDisabled}
        >
          {isAwaitingPayment ? '決済待ち' : '注文確定'}
        </Button>
      </div>

      {paymentDialog ? (
        <div className="payment-dialog-backdrop" role="presentation">
          <div
            className="payment-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-dialog-title"
          >
            {paymentDialog === 'method' ? (
              <>
                <div className="payment-dialog-header">
                  <h3 id="payment-dialog-title">お支払い方法</h3>
                  <p>支払い方法を選択して確定すると、メニュー画面に決済依頼を通知します。</p>
                </div>
                <div className="payment-method-options">
                  {(
                    [
                      { method: 'cash', label: '現金' },
                      { method: 'qr', label: 'QR' },
                      { method: 'other', label: '交通系' },
                      { method: 'card', label: 'クレジット' },
                      { method: 'square', label: 'カード' },
                    ] as const
                  ).map(({ method, label }) => (
                    <Button
                      key={method}
                      className="px-4 py-4"
                      variant={selectedMethod === method ? 'primary' : 'secondary'}
                      onClick={() => setSelectedMethod(method)}
                      disabled={isPaymentLocked}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
                <div className="payment-dialog-actions">
                  <Button
                    className="px-4 py-4"
                    variant="ghost"
                    onClick={closeDialog}
                    disabled={isPaymentLocked}
                  >
                    キャンセル
                  </Button>
                  {selectedMethod ? (
                    <Button
                      className="px-4 py-4"
                      variant="primary"
                      onClick={() => void requestPayment()}
                      disabled={isPaymentLocked}
                    >
                      確定
                    </Button>
                  ) : null}
                </div>
              </>
            ) : null}

            {paymentDialog === 'requested' ? (
              <>
                <div className="payment-dialog-header">
                  <h3 id="payment-dialog-title">決済依頼を通知しました</h3>
                  <p>
                    {selectedMethod
                      ? `${paymentMethodLabels[selectedMethod]}での決済依頼をメニュー画面に表示しています。`
                      : '決済依頼をメニュー画面に表示しています。'}
                  </p>
                </div>
                <div className="payment-dialog-status" aria-live="polite">
                  メニュー画面の決済ボタンが押されるまで待機してください。
                </div>
                <div className="payment-dialog-actions">
                  <Button className="px-4 py-4" variant="primary" onClick={closeRequestedDialog}>
                    閉じる
                  </Button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}
