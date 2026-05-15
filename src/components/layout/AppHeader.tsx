import { useClock } from '../../hooks/useClock'
import type { ViewName } from '../../types/app-route'
import { MainNavigation } from './MainNavigation'
import './AppHeader.css'

type AppHeaderProps = {
  activeView: ViewName
  staffName: string | null
  onViewChange: (viewName: ViewName) => void
  onLogout: () => void
}

export function AppHeader({ activeView, staffName, onViewChange, onLogout }: AppHeaderProps) {
  const clockLabel = useClock()

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="brand-group">
          <span className="brand-mark" aria-hidden="true">
            🌿
          </span>
          <span className="brand-title">
            <a href="/" className="text-white">SmartPOS</a>
          </span>
        </div>

        <MainNavigation activeView={activeView} onViewChange={onViewChange} />

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
            <button
              type="button"
              className="admin-link-button"
              onClick={() => onViewChange('products')}
            >
              管理者
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
