import { useEffect, useState } from 'react'
import { Button } from '../../components/actions/Button'
import type { PaymentMethod } from '../hooks/useCart'

type PaymentDialog = 'method' | 'requested' | 'completed' | null

type ReceiptActionsProps = {
  hasItems: boolean
  receiptNumber: number
  isAwaitingPayment: boolean
  paymentCompletedMessage: string | null
  onClearOrder: () => void
  onRequestPayment: (method: PaymentMethod) => Promise<void>
  onClearPaymentCompletedMessage: () => void
}

export function ReceiptActions({
  hasItems,
  isAwaitingPayment,
  paymentCompletedMessage,
  onClearOrder,
  onRequestPayment,
  onClearPaymentCompletedMessage,
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

  useEffect(() => {
    if (paymentCompletedMessage) {
      setPaymentDialog('completed')
    }
  }, [paymentCompletedMessage])

  const closeDialog = () => {
    if (!isPaymentLocked) {
      setSelectedMethod(null)
      setPaymentDialog(null)
    }
  }

  const closeCompletedDialog = () => {
    onClearPaymentCompletedMessage()
    setSelectedMethod(null)
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
                  <h3 id="payment-dialog-title">
                    {selectedMethod
                      ? `「${paymentMethodLabels[selectedMethod]}」決済依頼中`
                      : '決済依頼中'}
                  </h3>
                </div>
                <div className="py-3 text-center text-xl" aria-live="polite">
                  ユーザが決済が完了するまでお待ちください。
                </div>
              </>
            ) : null}

            {paymentDialog === 'completed' ? (
              <>
                <div className="payment-dialog-header">
                  <h3 id="payment-dialog-title">決済が完了しました</h3>
                  <p>{paymentCompletedMessage ?? '決済が完了しました。'}</p>
                </div>
                <div className="payment-dialog-status" aria-live="polite">
                  次の注文を開始できます。
                </div>
                <div className="payment-dialog-actions">
                  <Button className="px-4 py-4" variant="primary" onClick={closeCompletedDialog}>
                    注文開始
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
