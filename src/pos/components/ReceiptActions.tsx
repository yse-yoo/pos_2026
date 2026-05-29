import { type ReactNode, useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from '../../components/actions/Button'
import { formatReceiptNumber } from '../../lib/format/receipt'
import type { PaymentMethod } from '../hooks/useCart'

type PaymentDialog = 'cash' | 'electronic' | 'qr' | 'processing' | 'completed' | null
type ElectronicPaymentOption = {
  method: PaymentMethod
  label: string
  instruction: string
}

const electronicPaymentOptions: ElectronicPaymentOption[] = [
  {
    method: 'other',
    label: '交通系',
    instruction: '交通系ICカードを端末にタッチしてください。',
  },
  {
    method: 'card',
    label: 'クレジット',
    instruction: 'クレジットカードを端末にタッチ、または差し込んでください。',
  },
]

const PAYMENT_PROCESSING_DELAY_MS = 2200

const wait = (duration: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration)
  })

type ReceiptActionsProps = {
  hasItems: boolean
  receiptNumber: number
  isCompletingPayment: boolean
  onClearOrder: () => void
  onCompletePayment: (method: PaymentMethod, displayLabel?: string) => Promise<void>
}

export function ReceiptActions({
  hasItems,
  receiptNumber,
  isCompletingPayment,
  onClearOrder,
  onCompletePayment,
}: ReceiptActionsProps) {
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false)
  const [paymentDialog, setPaymentDialog] = useState<PaymentDialog>(null)
  const [selectedElectronicPayment, setSelectedElectronicPayment] =
    useState<ElectronicPaymentOption | null>(null)
  const [completedPaymentLabel, setCompletedPaymentLabel] = useState('')
  const isPaymentLocked = isCompletingPayment || paymentDialog === 'processing'
  const isDisabled = !hasItems || isPaymentLocked

  useEffect(() => {
    if (!hasItems) {
      setIsOrderConfirmed(false)
    }
  }, [hasItems])

  const openDialog = (dialog: Exclude<PaymentDialog, 'processing' | 'completed' | null>) => {
    setSelectedElectronicPayment(null)
    setCompletedPaymentLabel('')
    setPaymentDialog(dialog)
  }

  const closeDialog = () => {
    if (!isPaymentLocked) {
      setSelectedElectronicPayment(null)
      setCompletedPaymentLabel('')
      setPaymentDialog(null)
    }
  }

  const completePayment = async (method: PaymentMethod, displayLabel?: string) => {
    setSelectedElectronicPayment(null)
    setCompletedPaymentLabel(displayLabel ?? '')
    setPaymentDialog('processing')

    try {
      await Promise.all([
        onCompletePayment(method, displayLabel),
        wait(PAYMENT_PROCESSING_DELAY_MS),
      ])
      setPaymentDialog('completed')
    } catch {
      setCompletedPaymentLabel('')
      setPaymentDialog(null)
    }
  }

  const qrValue = formatReceiptNumber(receiptNumber)

  return (
    <>
      {isOrderConfirmed ? (
        <div className="receipt-actions">
          <Button
            className="px-4 py-4"
            variant="ghost"
            onClick={() => setIsOrderConfirmed(false)}
            disabled={isPaymentLocked}
          >
            戻る
          </Button>
          <Button
            variant="secondary"
            className="px-4 py-4"
            onClick={() => openDialog('cash')}
            disabled={isDisabled}
          >
            現金
          </Button>
          <Button
            variant="secondary"
            className="px-4 py-4"
            onClick={() => openDialog('qr')}
            disabled={isDisabled}
          >
            QR
          </Button>
          <Button
            variant="secondary"
            className="px-4 py-4"
            onClick={() => openDialog('electronic')}
            disabled={isDisabled}
          >
            電子決済
          </Button>
        </div>
      ) : (
        <div className="receipt-actions">
          <Button className="px-4 py-4" variant="ghost" onClick={onClearOrder} disabled={!hasItems}>
            クリア
          </Button>
          <Button
            variant="primary"
            className="px-4 py-4 receipt-confirm-button"
            onClick={() => setIsOrderConfirmed(true)}
            disabled={!hasItems}
          >
            注文確定
          </Button>
        </div>
      )}

      {paymentDialog ? (
        <div className="payment-dialog-backdrop" role="presentation">
          <div
            className="payment-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-dialog-title"
          >
            {paymentDialog === 'cash' ? (
              <PaymentDialogContent
                title="現金会計"
                message="現金を投入してください。"
                isCompletingPayment={isCompletingPayment}
                onCancel={closeDialog}
                actions={
                  <Button
                    className="px-4 py-4"
                    variant="primary"
                    onClick={() => void completePayment('cash', '現金')}
                    disabled={isCompletingPayment}
                  >
                    現金を受け取って会計
                  </Button>
                }
              />
            ) : null}

            {paymentDialog === 'qr' ? (
              <PaymentDialogContent
                title="QR決済"
                message="QRコードをお客様に提示し、読み取っていただいてください。"
                isCompletingPayment={isCompletingPayment}
                onCancel={closeDialog}
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
                    決済を確定
                  </Button>
                }
              />
            ) : null}

            {paymentDialog === 'electronic' ? (
              <PaymentDialogContent
                title="電子決済"
                message={
                  selectedElectronicPayment
                    ? selectedElectronicPayment.instruction
                    : '決済方法を選択してください。'
                }
                isCompletingPayment={isCompletingPayment}
                onCancel={closeDialog}
                actions={
                  <ElectronicPaymentActions
                    isCompletingPayment={isCompletingPayment}
                    selectedPayment={selectedElectronicPayment}
                    onSelectPayment={setSelectedElectronicPayment}
                    onComplete={completePayment}
                  />
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

type ElectronicPaymentActionsProps = {
  isCompletingPayment: boolean
  selectedPayment: ElectronicPaymentOption | null
  onSelectPayment: (payment: ElectronicPaymentOption) => void
  onComplete: (method: PaymentMethod, displayLabel?: string) => Promise<void>
}

function ElectronicPaymentActions({
  isCompletingPayment,
  selectedPayment,
  onSelectPayment,
  onComplete,
}: ElectronicPaymentActionsProps) {
  return (
    <>
      <div className="payment-method-options">
        {electronicPaymentOptions.map((payment) => (
          <Button
            key={payment.label}
            className="px-4 py-4"
            variant={selectedPayment?.label === payment.label ? 'primary' : 'secondary'}
            onClick={() => onSelectPayment(payment)}
            disabled={isCompletingPayment}
          >
            {payment.label}
          </Button>
        ))}
      </div>

      {selectedPayment ? (
        <Button
          className="px-6 py-4"
          variant="primary"
          onClick={() => void onComplete(selectedPayment.method, selectedPayment.label)}
          disabled={isCompletingPayment}
        >
          確定
        </Button>
      ) : null}
    </>
  )
}
