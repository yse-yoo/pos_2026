import { useState } from 'react'
import type { PosCategoryName } from '../../types/product'
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
    subtotal,
    tax,
    total,
    addItem,
    changeQuantity,
    clearOrder,
    completePayment,
    isCompletingPayment,
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
    <div className="pos-layout">
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
        subtotal={subtotal}
        tax={tax}
        total={total}
        isCompletingPayment={isCompletingPayment}
        paymentErrorMessage={paymentErrorMessage}
        onChangeQuantity={changeQuantity}
        onClearOrder={clearOrder}
        onCompletePayment={completePayment}
      />
    </div>
  )
}
