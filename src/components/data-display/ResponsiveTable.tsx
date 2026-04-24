import type { ReactNode } from 'react'
import './data-display.css'

export type ResponsiveTableColumn<T> = {
  key: string
  header: string
  className?: string
  render: (row: T) => ReactNode
}

type ResponsiveTableProps<T> = {
  data: T[]
  columns: ResponsiveTableColumn<T>[]
  renderMobileCard: (row: T) => ReactNode
  tableClassName?: string
  mobileListClassName?: string
}

export function ResponsiveTable<T>({
  data,
  columns,
  renderMobileCard,
  tableClassName,
  mobileListClassName,
}: ResponsiveTableProps<T>) {
  return (
    <>
      <div className="responsive-table-scroll">
        <table className={`responsive-table-desktop${tableClassName ? ` ${tableClassName}` : ''}`}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className={column.className}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={column.key} className={column.className}>
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`responsive-mobile-list${mobileListClassName ? ` ${mobileListClassName}` : ''}`}>
        {data.map((row, index) => (
          <div key={index}>{renderMobileCard(row)}</div>
        ))}
      </div>
    </>
  )
}
