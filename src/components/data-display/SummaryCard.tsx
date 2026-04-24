import type { ReactNode } from 'react'
import './data-display.css'

type SummaryCardProps = {
  label: string
  value: ReactNode
  className?: string
}

export function SummaryCard({ label, value, className }: SummaryCardProps) {
  return (
    <div className={`summary-card${className ? ` ${className}` : ''}`}>
      <span className="summary-card-label">{label}</span>
      <strong className="summary-card-value">{value}</strong>
    </div>
  )
}
