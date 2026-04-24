import type { ReactNode } from 'react'
import './PagePanel.css'

type PageHeaderProps = {
  kicker: string
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeader({ kicker, title, description, actions }: PageHeaderProps) {
  return (
    <div className="page-panel-header">
      <div className="page-panel-copy">
        <span className="page-panel-kicker">{kicker}</span>
        <h1 className="page-panel-title">{title}</h1>
        <p className="page-panel-description">{description}</p>
      </div>
      {actions ? actions : null}
    </div>
  )
}
