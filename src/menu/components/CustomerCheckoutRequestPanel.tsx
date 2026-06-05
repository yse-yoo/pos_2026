import { QRCodeSVG } from 'qrcode.react'
import { Button } from '../../components/actions/Button'
import { ErrorBanner } from '../../components/feedback/ErrorBanner'
import type { PendingCheckout } from '../../checkout/hooks/CheckoutContext'
import { formatCurrency } from '../../lib/format/currency'

const paymentGuidance = {
  cash: {
    title: '現金でお支払いください',
    description: 'レジ担当者に現金をお渡しください。',
    buttonLabel: '現金決済を完了する（仮想）',
  },
  qr: {
    title: 'QRコードを読み取ってください',
    description: '表示されたQRコードを決済アプリで読み取ってください。',
    buttonLabel: 'QR決済を完了する（仮想）',
  },
  transportation: {
    title: '交通系ICでお支払いください',
    description: '端末に交通系ICカードをタッチしてください。',
    buttonLabel: '交通系IC決済を完了する（仮想）',
  },
  card: {
    title: 'クレジットカードでお支払いください',
    description: '端末にカードをタッチ、または差し込んでください。',
    buttonLabel: 'カード決済を完了する（仮想）',
  },
  emoney: {
    title: '端末でタッチ決済してください',
    description: 'Square端末にカードまたはスマートフォンをタッチしてください。',
    buttonLabel: 'POS端末決済を完了する（仮想）',
  },
}

type CustomerCheckoutRequestPanelProps = {
  pendingCheckout: PendingCheckout
  isCompletingCheckout: boolean
  checkoutErrorMessage: string | null
  onCompleteCheckout: () => void
  onCancelCheckout: () => void
}

export function CustomerCheckoutRequestPanel({
  pendingCheckout,
  isCompletingCheckout,
  checkoutErrorMessage,
  onCompleteCheckout,
  onCancelCheckout,
}: CustomerCheckoutRequestPanelProps) {
  const checkoutGuidance = paymentGuidance[pendingCheckout.paymentMethod]

  return (
    <section className="rounded-2xl border border-[rgba(105,190,148,0.28)] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
      <div className="grid gap-4 min-[760px]:grid-cols-[minmax(0,1fr)_auto] min-[760px]:items-center">
        <div className="grid gap-3">
          <div>
            <h2 className="my-2 text-xl font-bold text-emerald-700">
              {checkoutGuidance.title}
            </h2>
            <p className="m-0 text-sm font-bold text-[#64748b]">
              {checkoutGuidance.description}
            </p>
          </div>
          {pendingCheckout.paymentMethod === 'qr' ? (
            <div className="grid place-items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white p-4">
              <QRCodeSVG value={pendingCheckout.id} size={180} />
              <span className="font-mono text-xs font-bold text-[#64748b]">
                {pendingCheckout.id}
              </span>
            </div>
          ) : null}
          <div className="grid gap-2 text-sm font-bold text-[#475569]">
            {pendingCheckout.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3">
                <span>{item.name} x {item.quantity}</span>
                <span className="font-mono">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 text-sm font-black text-[#64748b]">
            <span>合計</span>
            <strong className="font-mono text-2xl text-[var(--brand-dark)]">
              {formatCurrency(pendingCheckout.total)}
            </strong>
          </div>
          {checkoutErrorMessage ? (
            <ErrorBanner title="決済に失敗しました" message={checkoutErrorMessage} />
          ) : null}
        </div>
        {pendingCheckout.paymentMethod !== 'cash' ? (
          <div className="grid gap-3 rounded-xl bg-[#f8faf9] p-4 min-[760px]:min-w-64">
            <Button
              className="px-4 py-4"
              variant="primary"
              onClick={onCompleteCheckout}
              disabled={isCompletingCheckout}
            >
              {isCompletingCheckout ? '決済中...' : checkoutGuidance.buttonLabel}
            </Button>
            <Button
              className="px-4 py-4"
              variant="ghost"
              onClick={onCancelCheckout}
              disabled={isCompletingCheckout}
            >
              キャンセル
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
