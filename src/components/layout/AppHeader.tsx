import { Link } from 'react-router-dom'
import { useClock } from '../../hooks/useClock'
import type { ViewName } from '../../types/app-route'
import { MainNavigation } from './MainNavigation'
import './AppHeader.css'

type AppHeaderProps = {
  activeView: ViewName
  staffName: string | null
  isAdmin: boolean
  onLogout: () => void
}

export function AppHeader({ activeView, staffName, isAdmin, onLogout }: AppHeaderProps) {
  const clockLabel = useClock()

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="brand-group">
          <span className="brand-mark" aria-hidden="true">
            🌿
          </span>
          <span className="brand-title">
            <Link to="/" className="text-white">SmartPOS</Link>
          </span>
        </div>

        <MainNavigation activeView={activeView} showAdminLinks={isAdmin} />

        <div className="app-header-actions">
          <span className="clock-display">{clockLabel}</span>
          {staffName ? (
            <>
              <span className="admin-staff-label">{staffName}</span>
              <button type="button" className="admin-link-button" onClick={onLogout}>
                ログアウト
              </button>
            </>
          ) : (
            <Link to="/product" className="admin-link-button">
              ログイン
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
