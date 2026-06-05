export function CheckoutProcessingModal() {
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-[rgba(15,23,42,0.42)] p-4">
      <div
        className="grid w-full max-w-md gap-4 rounded-2xl bg-white p-6 text-center shadow-[0_24px_64px_rgba(15,23,42,0.24)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-processing-title"
      >
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[rgba(105,190,148,0.22)] border-t-[var(--brand)]" />
        <div className="grid gap-2">
          <h2 id="checkout-processing-title" className="m-0 text-xl font-black text-[var(--brand-dark)]">
            決済中です
          </h2>
          <p className="m-0 text-sm font-bold leading-6 text-[#64748b]">
            決済処理を送信しています。完了するまでこの画面でお待ちください。
          </p>
        </div>
      </div>
    </div>
  )
}
