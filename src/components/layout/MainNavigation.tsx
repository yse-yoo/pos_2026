import { Link } from 'react-router-dom'
import { productListPath } from '../../routing/appRoute'
import type { ViewName } from '../../types/app-route'

type MainNavigationProps = {
  activeView: ViewName
}

export function MainNavigation({ activeView }: MainNavigationProps) {
  return (
    <nav className="main-navigation" aria-label="メインナビゲーション">
      <Link
        to="/"
        className={`main-navigation-button${activeView === 'pos' ? ' is-active' : ''}`}
      >
        レジ
      </Link>
      <Link
        to="/sales/history"
        className={`main-navigation-button${activeView === 'history' ? ' is-active' : ''}`}
      >
        履歴
      </Link>
      <Link
        to="/sales/trend"
        className={`main-navigation-button${activeView === 'analytics' ? ' is-active' : ''}`}
      >
        売上推移
      </Link>
      <Link
        to={productListPath}
        className={`main-navigation-button${activeView === 'products' ? ' is-active' : ''}`}
      >
        商品管理
      </Link>
    </nav>
  )
}
