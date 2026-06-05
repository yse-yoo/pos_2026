import { useState } from 'react'
import type { PosCategoryName } from '../types/product'
import { useProductCatalog } from '../products/hooks/useProductCatalog'
import { ProductPanel } from './components/ProductPanel'
import { ReceiptPanel } from './components/ReceiptPanel'
import { useCart } from './hooks/useCart'
import './pos.css'

export function PosPage() {
  const { categories, posProducts } = useProductCatalog()
  const {
    cartItems,
    receiptNumber,
    orderType,
    taxRatePercent,
    subtotal,
    tax,
    total,
    addItem,
    changeQuantity,
    setOrderType,
    clearOrder,
    requestPayment,
    startCashPayment,
    finalizeCashPayment,
    cancelCashPayment,
    isAwaitingPayment,
    paymentCompletedMessage,
    clearPaymentCompletedMessage,
    paymentErrorMessage,
  } = useCart()
  const [selectedCategory, setSelectedCategory] = useState<PosCategoryName>('全て')
  const posCategories: PosCategoryName[] = [
    '全て',
    ...categories.filter((category) => category.isActive).map((category) => category.name),
  ]

  const filteredProducts =
    selectedCategory === '全て'
      ? posProducts
      : posProducts.filter((product) => product.category === selectedCategory)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_31.25rem] items-start gap-6 h-full min-h-0 max-[900px]:grid-cols-1">
      <ProductPanel
        categories={posCategories}
        selectedCategory={selectedCategory}
        products={filteredProducts}
        onSelectCategory={setSelectedCategory}
        onAddItem={addItem}
      />

      <ReceiptPanel
        items={cartItems}
        receiptNumber={receiptNumber}
        orderType={orderType}
        taxRatePercent={taxRatePercent}
        subtotal={subtotal}
        tax={tax}
        total={total}
        isAwaitingPayment={isAwaitingPayment}
        paymentCompletedMessage={paymentCompletedMessage}
        paymentErrorMessage={paymentErrorMessage}
        onChangeQuantity={changeQuantity}
        onChangeOrderType={setOrderType}
        onClearOrder={clearOrder}
        onRequestPayment={requestPayment}
        onStartCashPayment={startCashPayment}
        onFinalizeCashPayment={finalizeCashPayment}
        onCancelCashPayment={cancelCashPayment}
        onClearPaymentCompletedMessage={clearPaymentCompletedMessage}
      />
    </div>
  )
}
