import { useEffect, useMemo, useState } from 'react'
import './App.css'

type ViewName = 'pos' | 'history' | 'products'
type CategoryName = '全て' | 'フード' | 'ドリンク' | 'トッピング' | '有料袋'

type Product = {
  id: number
  name: string
  price: number
  category: Exclude<CategoryName, '全て'>
  icon: string
}

type CartItem = Product & {
  quantity: number
}

const TAX_RATE = 0.1

const navItems: Array<{ key: ViewName; label: string }> = [
  { key: 'pos', label: 'レジ' },
  { key: 'history', label: '履歴' },
  { key: 'products', label: '商品管理' },
]

const categories: CategoryName[] = ['全て', 'フード', 'ドリンク', 'トッピング', '有料袋']

const products: Product[] = [
  { id: 1, name: 'チョコバナナ生クリーム', price: 580, category: 'フード', icon: '🍌' },
  { id: 2, name: 'イチゴカスタード', price: 620, category: 'フード', icon: '🍓' },
  { id: 3, name: '塩キャラメルアーモンド', price: 550, category: 'フード', icon: '🍯' },
  { id: 4, name: '抹茶あずき白玉', price: 650, category: 'フード', icon: '🍵' },
  { id: 5, name: 'ハムエッグチーズ', price: 680, category: 'フード', icon: '🥓' },
  { id: 6, name: 'ツナサラダマヨネーズ', price: 600, category: 'フード', icon: '🐟' },
  { id: 7, name: '照り焼きチキンサラダ', price: 720, category: 'フード', icon: '🍗' },
  { id: 8, name: '自家製レモネード', price: 450, category: 'ドリンク', icon: '🍋' },
  { id: 9, name: 'タピオカミルクティー', price: 550, category: 'ドリンク', icon: '🧋' },
  { id: 10, name: 'アイスコーヒー', price: 380, category: 'ドリンク', icon: '☕' },
  { id: 11, name: 'バニラアイス追加', price: 100, category: 'トッピング', icon: '🍨' },
  { id: 12, name: 'お持ち帰り用袋', price: 10, category: '有料袋', icon: '🛍️' },
]

const placeholderContent: Record<Exclude<ViewName, 'pos'>, { title: string; description: string }> =
  {
    history: {
      title: '売上履歴',
      description: '売上履歴画面は次フェーズで実装予定です。この画面から過去の会計一覧と詳細へ遷移します。',
    },
    products: {
      title: '商品管理',
      description: '商品管理画面は次フェーズで実装予定です。商品一覧、登録、編集、削除の入口になります。',
    },
  }

const formatCurrency = (value: number) => `¥${value.toLocaleString('ja-JP')}`

const formatReceiptNumber = (value: number) => `NO.${String(value).padStart(4, '0')}`

const createClockLabel = () =>
  new Date().toLocaleTimeString('ja-JP', {
    hour12: false,
  })

function App() {
  const [activeView, setActiveView] = useState<ViewName>('pos')
  const [selectedCategory, setSelectedCategory] = useState<CategoryName>('全て')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [receiptNumber, setReceiptNumber] = useState(1)
  const [clockLabel, setClockLabel] = useState(createClockLabel)

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setClockLabel(createClockLabel())
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [])

  const filteredProducts = useMemo(() => {
    if (selectedCategory === '全て') {
      return products
    }

    return products.filter((product) => product.category === selectedCategory)
  }, [selectedCategory])

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  )
  const tax = Math.round(subtotal * TAX_RATE)
  const total = subtotal + tax

  const addItem = (product: Product) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id)

      if (!existingItem) {
        return [...currentItems, { ...product, quantity: 1 }]
      }

      return currentItems.map((item) =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
      )
    })
  }

  const changeQuantity = (productId: number, delta: number) => {
    setCartItems((currentItems) =>
      currentItems.reduce<CartItem[]>((nextItems, item) => {
        if (item.id !== productId) {
          nextItems.push(item)
          return nextItems
        }

        const nextQuantity = item.quantity + delta
        if (nextQuantity > 0) {
          nextItems.push({ ...item, quantity: nextQuantity })
        }

        return nextItems
      }, []),
    )
  }

  const clearOrder = () => {
    if (cartItems.length === 0) {
      return
    }

    const shouldClear = window.confirm('注文をすべて削除しますか？')
    if (shouldClear) {
      setCartItems([])
    }
  }

  const completePayment = (method: string) => {
    if (cartItems.length === 0) {
      return
    }

    window.alert(`会計完了 (${method}): ${formatCurrency(total)}`)
    setCartItems([])
    setReceiptNumber((currentNumber) => currentNumber + 1)
  }

  const renderPosView = () => (
    <div className="pos-layout">
      <section className="panel product-panel">
        <div className="category-tabs" role="tablist" aria-label="商品カテゴリ">
          {categories.map((category) => (
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

      <aside className="panel receipt-panel">
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
          <button
            type="button"
            className="action-button action-button-ghost"
            onClick={clearOrder}
            disabled={cartItems.length === 0}
          >
            クリア
          </button>
          <button
            type="button"
            className="action-button action-button-secondary"
            onClick={() => completePayment('現金')}
            disabled={cartItems.length === 0}
          >
            現金
          </button>
          <button
            type="button"
            className="action-button action-button-secondary"
            onClick={() => completePayment('カード')}
            disabled={cartItems.length === 0}
          >
            カード
          </button>
          <button
            type="button"
            className="action-button action-button-primary"
            onClick={() => completePayment('会計確定')}
            disabled={cartItems.length === 0}
          >
            会計確定
          </button>
        </div>
      </aside>
    </div>
  )

  const renderPlaceholderView = (viewName: Exclude<ViewName, 'pos'>) => {
    const content = placeholderContent[viewName]

    return (
      <section className="panel placeholder-panel">
        <span className="placeholder-badge">Coming soon</span>
        <h2>{content.title}</h2>
        <p>{content.description}</p>
      </section>
    )
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-group">
            <span className="brand-mark" aria-hidden="true">
              🌿
            </span>
            <span className="brand-title">SmartPOS</span>
          </div>

          <nav className="global-nav" aria-label="メインナビゲーション">
            {navItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`nav-button${activeView === item.key ? ' is-active' : ''}`}
                onClick={() => setActiveView(item.key)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="topbar-actions">
            <span className="clock-display">{clockLabel}</span>
            <button
              type="button"
              className="admin-button"
              onClick={() => window.alert('管理者メニューは今後の画面で対応予定です。')}
            >
              管理者
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {activeView === 'pos' ? renderPosView() : renderPlaceholderView(activeView)}
      </main>
    </div>
  )
}

export default App
