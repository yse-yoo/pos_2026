import { useMemo, useState } from 'react'
import { ErrorBanner } from '../components/feedback/ErrorBanner'
import { LoadingState } from '../components/feedback/LoadingState'
import { useCheckout } from '../checkout/hooks/useCheckout'
import { useOrderDraft } from '../order-draft/hooks/useOrderDraft'
import { useProductCatalog } from '../products/hooks/useProductCatalog'
import type { PosCategoryName } from '../types/product'
import { CheckoutProcessingModal } from './components/CheckoutProcessingModal'
import { CurrentOrderDraftPanel } from './components/CurrentOrderDraftPanel'
import { CustomerCheckoutRequestPanel } from './components/CustomerCheckoutRequestPanel'
import { CustomerMenuProductSection } from './components/CustomerMenuProductSection'
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
  const { orderDraft } = useOrderDraft()
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
        <CustomerCheckoutRequestPanel
          pendingCheckout={pendingCheckout}
          isCompletingCheckout={isCompletingCheckout}
          checkoutErrorMessage={checkoutErrorMessage}
          onCompleteCheckout={() => void completePendingCheckout()}
          onCancelCheckout={() => void cancelPendingCheckout()}
        />
      ) : null}

      {!pendingCheckout && orderDraft ? (
        <CurrentOrderDraftPanel orderDraft={orderDraft} />
      ) : null}

      {isCompletingCheckout ? <CheckoutProcessingModal /> : null}

      {isLoading ? (
        <LoadingState
          title="メニューを読み込み中です"
          description="販売中の商品と売り切れ情報を取得しています。"
        />
      ) : null}

      {!isLoading && !errorMessage ? (
        <CustomerMenuProductSection
          categories={menuCategories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          products={filteredProducts}
        />
      ) : null}
    </div>
  )
}
