import { apiRequest } from '../../lib/api/client'
import type { SaleDetail, Sale } from '../../types/sale'
import type { SaleItem } from '../../types/saleItem'

type SaleResource = {
  id: number
  receipt_number: string | null
  sold_at: string
  subtotal?: number
  tax_total?: number
  total: number
  payment_method: string
  cash_received?: number | null
  change_amount?: number | null
  status?: string
}

type SaleDetailResource = SaleResource & {
  items?: Array<{
    id: number
    product_name: string
    category_name: string | null
    unit_price: number
    quantity: number
    tax_rate: number
    tax_amount: number
    subtotal: number
    total: number
  }>
}

const paymentMethodLabels: Record<string, string> = {
  cash: '現金',
  card: 'カード',
  qr: 'QR',
  other: 'その他',
}

const mapSale = (sale: SaleResource, itemCount: number): Sale => ({
  id: Number(sale.id),
  receiptNumber: sale.receipt_number ?? `NO.${String(sale.id).padStart(4, '0')}`,
  soldAt: sale.sold_at,
  itemCount,
  totalAmount: Number(sale.total),
  paymentMethod: paymentMethodLabels[sale.payment_method] ?? sale.payment_method,
})

const mapSaleDetailItem = (item: NonNullable<SaleDetailResource['items']>[number]): SaleItem => ({
  id: Number(item.id),
  productName: item.product_name,
  categoryName: item.category_name ?? '',
  unitPrice: Number(item.unit_price),
  quantity: Number(item.quantity),
  taxRate: Number(item.tax_rate),
  taxAmount: Number(item.tax_amount),
  subtotal: Number(item.subtotal),
  total: Number(item.total),
})

const mapSaleDetail = (sale: SaleDetailResource): SaleDetail => {
  const items = sale.items?.map(mapSaleDetailItem) ?? []

  return {
    ...mapSale(sale, items.reduce((sum, item) => sum + item.quantity, 0)),
    subtotal: Number(sale.subtotal ?? 0),
    taxTotal: Number(sale.tax_total ?? 0),
    cashReceived: sale.cash_received === null || sale.cash_received === undefined ? null : Number(sale.cash_received),
    changeAmount: sale.change_amount === null || sale.change_amount === undefined ? null : Number(sale.change_amount),
    status: sale.status ?? '',
    items,
  }
}

export const listSalesHistory = async (): Promise<Sale[]> => {
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

export const getSaleDetail = async (saleId: number): Promise<SaleDetail> => {
  const sale = await apiRequest<SaleDetailResource>(`/api/sales/${saleId}`)
  return mapSaleDetail(sale)
}
