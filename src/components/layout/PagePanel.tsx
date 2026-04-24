import type { PropsWithChildren } from 'react'
import './PagePanel.css'

type PagePanelProps = PropsWithChildren<{
  className?: string
}>

export function PagePanel({ className, children }: PagePanelProps) {
  return <section className={`page-panel${className ? ` ${className}` : ''}`}>{children}</section>
}
