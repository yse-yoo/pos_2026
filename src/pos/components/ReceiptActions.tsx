import { type ReactNode, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '../../components/actions/Button'
import { formatReceiptNumber } from '../../lib/format/receipt'
import type { PaymentMethod } from '../hooks/useCart'

type PaymentDialog = 'cash' | 'qr' | 'square' | 'processing' | 'completed' | null

type ReceiptActionsProps = {
  hasItems: boolean
  receiptNumber: number
  isCompletingPayment: boolean
  onClearOrder: () => void
  onCompletePayment: (method: PaymentMethod) => Promise<void>
}

export function ReceiptActions({
  hasItems,
  receiptNumber,
  isCompletingPayment,
  onClearOrder,
  onCompletePayment,
}: ReceiptActionsProps) {
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialog>(null)
  const [completedPaymentLabel, setCompletedPaymentLabel] = useState('')
  const isPaymentLocked = isCompletingPayment || paymentDialog === 'processing'
  const isDisabled = !hasItems || isPaymentLocked

  const openDialog = (dialog: Exclude<PaymentDialog, 'processing' | 'completed' | null>) => {
    setCompletedPaymentLabel('')
    setPaymentDialog(dialog)
  }

  const closeDialog = () => {
    if (!isPaymentLocked) {
      setCompletedPaymentLabel('')
      setPaymentDialog(null)
    }
  }

  const completePayment = async (method: PaymentMethod, displayLabel?: string) => {
    setCompletedPaymentLabel(displayLabel ?? '')
    setPaymentDialog('processing')

    try {
      await onCompletePayment(method)
      setPaymentDialog('completed')
    } catch {
      setCompletedPaymentLabel('')
      setPaymentDialog(null)
    }
  }

  const qrValue = formatReceiptNumber(receiptNumber)

  const backToSquare = () => {
    if (!isPaymentLocked) {
      setSelectedElectronicPayment(null)
      setPaymentDialog('square')
    }
  }

  return (
    <>
      <div className="receipt-actions">
        <Button className="px-4 py-4" variant="ghost" onClick={onClearOrder} disabled={!hasItems}>
          クリア
        </Button>
        <Button
          variant="primary"
          className="px-4 py-4 receipt-confirm-button"
          onClick={() => openDialog('square')}
          disabled={isDisabled}
        >
          注文確定
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
            {paymentDialog === 'square' ? (
              <>
                <div className="payment-dialog-header">
                  <h3 id="payment-dialog-title">お支払い方法</h3>
                  <p>支払い方法を選択してください。</p>
                </div>
                <div className="payment-method-options">
                  <Button
                    className="px-4 py-4"
                    variant="secondary"
                    onClick={() => setPaymentDialog('cash')}
                    disabled={isPaymentLocked}
                  >
                    現金
                  </Button>
                  <Button
                    className="px-4 py-4"
                    variant="secondary"
                    onClick={() => setPaymentDialog('qr')}
                    disabled={isPaymentLocked}
                  >
                    QR
                  </Button>
                  <Button
                    className="px-4 py-4"
                    variant="secondary"
                    onClick={() => void completePayment('other', '交通系')}
                    disabled={isPaymentLocked}
                  >
                    交通系
                  </Button>
                  <Button
                    className="px-4 py-4"
                    variant="secondary"
                    onClick={() => void completePayment('card', 'クレジット')}
                    disabled={isPaymentLocked}
                  >
                    クレジット
                  </Button>
                  <Button
                    className="px-4 py-4"
                    variant="primary"
                    onClick={() => void completePayment('square', 'Square')}
                    disabled={isPaymentLocked}
                  >
                    カード
                  </Button>
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
                </div>
              </>
            ) : null}

            {paymentDialog === 'cash' ? (
              <PaymentDialogContent
                title="現金会計"
                message="現金を投入してください。"
                isCompletingPayment={isCompletingPayment}
                onCancel={backToSquare}
                actions={
                  <Button
                    className="px-4 py-4"
                    variant="primary"
                    onClick={() => void completePayment('cash', '現金')}
                    disabled={isCompletingPayment}
                  >
                    現金で会計
                  </Button>
                }
              />
            ) : null}

            {paymentDialog === 'qr' ? (
              <PaymentDialogContent
                title="QR決済"
                message="QRコードをお客様に提示し、読み取っていただいてください。"
                isCompletingPayment={isCompletingPayment}
                onCancel={backToSquare}
                body={
                  <div className="flex flex-col items-center gap-3 py-4">
                    <div className="p-3 bg-white rounded-xl border border-[#e2e8f0]">
                      <QRCodeSVG value={qrValue} size={180} />
                    </div>
                    <span className="font-mono text-sm font-bold text-slate-500">{qrValue}</span>
                  </div>
                }
                actions={
                  <Button
                    className="px-4 py-4"
                    variant="primary"
                    onClick={() => void completePayment('qr', 'QR')}
                    disabled={isCompletingPayment}
                  >
                    QR決済
                  </Button>
                }
              />
            ) : null}

            {paymentDialog === 'processing' ? (
              <PaymentProcessingContent paymentLabel={completedPaymentLabel} />
            ) : null}

            {paymentDialog === 'completed' ? (
              <PaymentCompletedContent paymentLabel={completedPaymentLabel} onClose={closeDialog} />
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  )
}

type PaymentProcessingContentProps = {
  paymentLabel: string
}

function PaymentProcessingContent({ paymentLabel }: PaymentProcessingContentProps) {
  return (
    <>
      <div className="payment-dialog-header">
        <h3 id="payment-dialog-title">決済処理中</h3>
        <p>{paymentLabel ? `${paymentLabel}で決済しています。` : '決済しています。'}</p>
      </div>

      <div className="payment-processing-state" aria-live="polite">
        <span className="payment-processing-spinner" aria-hidden="true" />
        <span>決済中...</span>
      </div>
    </>
  )
}

type PaymentCompletedContentProps = {
  paymentLabel: string
  onClose: () => void
}

function PaymentCompletedContent({ paymentLabel, onClose }: PaymentCompletedContentProps) {
  return (
    <>
      <div className="payment-dialog-header">
        <h3 id="payment-dialog-title">決済完了</h3>
        <p>{paymentLabel ? `${paymentLabel}での決済が完了しました。` : '決済が完了しました。'}</p>
      </div>

      <div className="payment-dialog-status" aria-live="polite">
        決済が完了しました。
      </div>

      <div className="payment-dialog-actions">
        <Button className="px-4 py-4" variant="primary" onClick={onClose}>
          閉じる
        </Button>
      </div>
    </>
  )
}

type PaymentDialogContentProps = {
  title: string
  message: string
  isCompletingPayment: boolean
  actions: ReactNode
  body?: ReactNode
  onCancel: () => void
}

function PaymentDialogContent({
  title,
  message,
  isCompletingPayment,
  actions,
  body,
  onCancel,
}: PaymentDialogContentProps) {
  return (
    <>
      <div className="payment-dialog-header">
        <h3 id="payment-dialog-title">{title}</h3>
        <p>{message}</p>
      </div>

      {body ?? null}

      <div className="payment-dialog-actions">
        <Button className="px-4 py-4" variant="ghost" onClick={onCancel} disabled={isCompletingPayment}>
          戻る
        </Button>
        {actions}
      </div>
    </>
  )
}

