import type { ReactNode } from 'react'
import './data-display.css'

type InfoPair = {
  label: string
  value: ReactNode
}

type InfoPairListProps = {
  items: InfoPair[]
  className?: string
}

export function InfoPairList({ items, className }: InfoPairListProps) {
  return (
    <dl className={`info-pair-list${className ? ` ${className}` : ''}`}>
      {items.map((item) => (
        <div key={item.label} className="info-pair-list-row">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
