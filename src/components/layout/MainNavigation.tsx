import type { ViewName } from '../../types/app-route'

type MainNavigationProps = {
  activeView: ViewName
  onViewChange: (viewName: ViewName) => void
}

const navItems: Array<{ key: ViewName; label: string }> = [
  { key: 'pos', label: 'レジ' },
  { key: 'history', label: '履歴' },
  { key: 'products', label: '商品管理' },
]

export function MainNavigation({ activeView, onViewChange }: MainNavigationProps) {
  return (
    <nav className="main-navigation" aria-label="メインナビゲーション">
      {navItems.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`main-navigation-button${activeView === item.key ? ' is-active' : ''}`}
          onClick={() => onViewChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
