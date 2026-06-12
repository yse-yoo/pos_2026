import { Link } from 'react-router-dom'
import { customerMenuPath, posRegisterPath, productListPath } from '../../routing/appRoute'
import type { ViewName } from '../../types/app-route'

type MainNavigationProps = {
  activeView: ViewName
  showAdminLinks: boolean
}

export function MainNavigation({ activeView, showAdminLinks }: MainNavigationProps) {
  return (
    <nav className="main-navigation" aria-label="メインナビゲーション">
      {showAdminLinks ? (
        <>
          <Link
            to={customerMenuPath}
            className={`main-navigation-button${activeView === 'menu' ? ' is-active' : ''}`}
          >
            メニュー
          </Link>
          <Link
            to={posRegisterPath}
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
        </>
      ) : null}
    </nav>
  )
}
