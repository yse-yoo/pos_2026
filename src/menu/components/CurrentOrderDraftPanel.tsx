import { formatCurrency } from '../../lib/format/currency'
import type { OrderDraft } from '../../order-draft/api/orderDraftRepository'
import { OrderDraftItems } from './OrderDraftItems'

type CurrentOrderDraftPanelProps = {
  orderDraft: OrderDraft
}

export function CurrentOrderDraftPanel({ orderDraft }: CurrentOrderDraftPanelProps) {
  return (
    <section className="rounded-2xl border border-[#edf2ef] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)]">
      <div className="grid gap-4 min-[760px]:grid-cols-[minmax(0,1fr)_auto] min-[760px]:items-center">
        <div className="grid gap-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="my-2 text-xl font-bold text-emerald-700">現在のご注文</h2>
              <p className="m-0 text-sm font-bold text-[#64748b]">
                レジ担当者が入力した注文内容を表示しています。
              </p>
            </div>
          </div>
          <OrderDraftItems items={orderDraft.items} />
        </div>
        <div className="grid gap-2 rounded-xl bg-[#f8faf9] p-4 min-[760px]:min-w-64">
          <div className="flex items-center justify-between gap-4 text-sm font-black text-[#64748b]">
            <span>小計</span>
            <span className="font-mono">{formatCurrency(orderDraft.subtotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-sm font-black text-[#64748b]">
            <span>消費税</span>
            <span className="font-mono">{formatCurrency(orderDraft.tax)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-[#e2e8f0] pt-2 text-sm font-black text-[#64748b]">
            <span>合計</span>
            <strong className="font-mono text-2xl text-[var(--brand-dark)]">
              {formatCurrency(orderDraft.total)}
            </strong>
          </div>
          <div className="flex items-center justify-end">
            <span className={`mt-2 shrink-0 rounded-full px-3 py-1 text-xs font-black ${orderDraft.orderType === 'dineIn' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {orderDraft.orderType === 'dineIn' ? '店内' : 'テイクアウト'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
