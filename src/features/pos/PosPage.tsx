import { useState } from 'react'
import { Button } from '../../components/actions/Button'
import { formatCurrency } from '../../lib/format/currency'
import { formatReceiptNumber } from '../../lib/format/receipt'
import type { PosCategoryName } from '../../types/product'
import { useProductCatalog } from '../products/hooks/useProductCatalog'
import { useCart } from './hooks/useCart'
import './pos.css'

const posCategories: PosCategoryName[] = ['全て', 'フード', 'ドリンク', 'トッピング', '有料袋']

export function PosPage() {
  const { posProducts } = useProductCatalog()
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
  } = useCart()
  const [selectedCategory, setSelectedCategory] = useState<PosCategoryName>('全て')

  const filteredProducts =
    selectedCategory === '全て'
      ? posProducts
      : posProducts.filter((product) => product.category === selectedCategory)

  return (
    <div className="pos-layout">
      <section className="page-panel product-panel">
        <div className="category-tabs" role="tablist" aria-label="商品カテゴリ">
          {posCategories.map((category) => (
            <button
              key={category}
              type="button"
              className={`category-tab${selectedCategory === category ? ' is-active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              type="button"
              className="product-card"
              onClick={() => addItem(product)}
            >
              <span className="product-icon" aria-hidden="true">
                {product.icon}
              </span>
              <span className="product-name">{product.name}</span>
              <span className="product-price">{formatCurrency(product.price)}</span>
            </button>
          ))}
        </div>
      </section>

      <aside className="page-panel receipt-panel">
        <div className="receipt-header">
          <h2>注文内容</h2>
          <span className="receipt-number">{formatReceiptNumber(receiptNumber)}</span>
        </div>

        <div className="receipt-items">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <p>No items selected</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="receipt-item">
                <span className="receipt-item-icon" aria-hidden="true">
                  {item.icon}
                </span>

                <div className="receipt-item-body">
                  <span className="receipt-item-name">{item.name}</span>
                  <span className="receipt-item-unit">{formatCurrency(item.price)} / unit</span>
                </div>

                <div className="quantity-control" aria-label={`${item.name} の数量調整`}>
                  <button type="button" onClick={() => changeQuantity(item.id, -1)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => changeQuantity(item.id, 1)}>
                    +
                  </button>
                </div>

                <span className="receipt-item-total">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="receipt-summary">
          <div className="summary-row">
            <span>小計</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="summary-row summary-row-muted">
            <span>消費税 (10%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="summary-total">
            <span>合計金額</span>
            <strong>{formatCurrency(total)}</strong>
          </div>
        </div>

        <div className="receipt-actions">
          <Button variant="ghost" onClick={clearOrder} disabled={cartItems.length === 0}>
            クリア
          </Button>
          <Button
            variant="secondary"
            onClick={() => completePayment('現金')}
            disabled={cartItems.length === 0}
          >
            現金
          </Button>
          <Button
            variant="secondary"
            onClick={() => completePayment('カード')}
            disabled={cartItems.length === 0}
          >
            カード
          </Button>
          <Button
            variant="primary"
            onClick={() => completePayment('会計確定')}
            disabled={cartItems.length === 0}
          >
            会計確定
          </Button>
        </div>
      </aside>
    </div>
  )
}
