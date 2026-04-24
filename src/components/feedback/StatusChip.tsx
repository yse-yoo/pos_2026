import type { ReactNode } from 'react'
import './feedback.css'

type StatusChipTone = 'neutral' | 'cash' | 'card' | 'active' | 'inactive'

type StatusChipProps = {
  children: ReactNode
  tone?: StatusChipTone
  mono?: boolean
  className?: string
}

export function StatusChip({
  children,
  tone = 'neutral',
  mono = false,
  className,
}: StatusChipProps) {
  return (
    <span
      className={`status-chip status-chip-${tone}${mono ? ' status-chip-mono' : ''}${className ? ` ${className}` : ''}`}
    >
      {children}
    </span>
  )
}
