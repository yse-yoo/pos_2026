import { apiRequest } from '../../../lib/api/client'
import type { SalesHistoryItem } from '../../../types/sales'

type SaleResource = {
  id: number
  receipt_number: string | null
  sold_at: string
  total: number
  payment_method: string
}

type SaleDetailResource = SaleResource & {
  items?: Array<{
    quantity: number
  }>
}

const paymentMethodLabels: Record<string, string> = {
  cash: '現金',
  card: 'カード',
  qr: 'QR',
  other: 'その他',
}

const mapSale = (sale: SaleResource, itemCount: number): SalesHistoryItem => ({
  id: Number(sale.id),
  receiptNumber: sale.receipt_number ?? `NO.${String(sale.id).padStart(4, '0')}`,
  soldAt: sale.sold_at,
  itemCount,
  totalAmount: Number(sale.total),
  paymentMethod: paymentMethodLabels[sale.payment_method] ?? sale.payment_method,
})

export const listSalesHistory = async (): Promise<SalesHistoryItem[]> => {
  const sales = await apiRequest<SaleResource[]>('/api/sales?limit=50')
  const details = await Promise.all(
    sales.map((sale) => apiRequest<SaleDetailResource>(`/api/sales/${sale.id}`)),
  )
  const itemCounts = new Map(
    details.map((sale) => [
      Number(sale.id),
      sale.items?.reduce((sum, item) => sum + Number(item.quantity), 0) ?? 0,
    ]),
  )

  return sales.map((sale) => mapSale(sale, itemCounts.get(Number(sale.id)) ?? 0))
}
