import { useMemo, useState } from 'react'
import { Button } from '../components/actions/Button'
import { EmptyState } from '../components/feedback/EmptyState'
import { ErrorBanner } from '../components/feedback/ErrorBanner'
import { LoadingState } from '../components/feedback/LoadingState'
import { useCheckout } from '../checkout/hooks/useCheckout'
import { formatCurrency } from '../lib/format/currency'
import { CategoryTabs } from '../pos/components/CategoryTabs'
import { useProductCatalog } from '../products/hooks/useProductCatalog'
import type { PosCategoryName } from '../types/product'
import { CustomerMenuCard } from './components/CustomerMenuCard'
import './customer-menu.css'

export function CustomerMenuPage() {
  const { categories, posProducts, isLoading, errorMessage } = useProductCatalog()
  const {
    pendingCheckout,
    isCompletingCheckout,
    checkoutErrorMessage,
    completePendingCheckout,
    cancelPendingCheckout,
  } = useCheckout()
  const [selectedCategory, setSelectedCategory] = useState<PosCategoryName>('全て')
  const menuCategories: PosCategoryName[] = useMemo(
    () => [
      '全て',
      ...categories.filter((category) => category.isActive).map((category) => category.name),
    ],
    [categories],
  )
  const filteredProducts =
    selectedCategory === '全て'
      ? posProducts
      : posProducts.filter((product) => product.category === selectedCategory)

  return (
    <div className="customer-menu-page">
      {errorMessage ? (
        <ErrorBanner title="メニュー取得に失敗しました" message={errorMessage} />
      ) : null}

      {pendingCheckout ? (
        <section className="rounded-2xl border border-[rgba(105,190,148,0.28)] bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)]">
          <div className="grid gap-4 min-[760px]:grid-cols-[minmax(0,1fr)_auto] min-[760px]:items-center">
            <div className="grid gap-3">
              <div>
                <span className="text-xs font-black uppercase text-[var(--brand-dark)]">
                  Payment request
                </span>
                <h2 className="m-0 text-xl font-black text-[#334155]">決済依頼があります</h2>
              </div>
              <div className="grid gap-2 text-sm font-bold text-[#475569]">
                {pendingCheckout.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <span>{item.name} x {item.quantity}</span>
                    <span className="font-mono">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              {checkoutErrorMessage ? (
                <ErrorBanner title="決済に失敗しました" message={checkoutErrorMessage} />
              ) : null}
            </div>
            <div className="grid gap-3 rounded-xl bg-[#f8faf9] p-4 min-[760px]:min-w-64">
              <div className="flex items-center justify-between gap-4 text-sm font-black text-[#64748b]">
                <span>合計</span>
                <strong className="font-mono text-2xl text-[var(--brand-dark)]">
                  {formatCurrency(pendingCheckout.total)}
                </strong>
              </div>
              <Button
                className="px-4 py-4"
                variant="primary"
                onClick={() => void completePendingCheckout()}
                disabled={isCompletingCheckout}
              >
                {isCompletingCheckout ? '決済中...' : '仮想決済する'}
              </Button>
              <Button
                className="px-4 py-4"
                variant="ghost"
                onClick={cancelPendingCheckout}
                disabled={isCompletingCheckout}
              >
                キャンセル
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {isLoading ? (
        <LoadingState
          title="メニューを読み込み中です"
          description="販売中の商品と売り切れ情報を取得しています。"
        />
      ) : null}

      {!isLoading && !errorMessage ? (
        <section className="customer-menu-body">
          <CategoryTabs
            categories={menuCategories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {filteredProducts.length === 0 ? (
            <EmptyState
              icon="🍽️"
              title="表示できる商品がありません"
              description="カテゴリを変更して商品をご確認ください。"
            />
          ) : (
            <div className="customer-menu-grid" aria-label="商品メニュー">
              {filteredProducts.map((product) => (
                <CustomerMenuCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  )
}
