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
  item_count?: number
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
  emoney: 'その他',
  transportation: '交通系',
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

type SalesListResource = {
  items: SaleResource[]
  total: number
}

export const PAGE_SIZE = 20

export const listSalesHistory = async (
  page: number,
  limit: number = PAGE_SIZE,
): Promise<{ sales: Sale[]; total: number }> => {
  const offset = (page - 1) * limit
  const { items, total } = await apiRequest<SalesListResource>(
    `/api/sales?limit=${limit}&offset=${offset}`,
  )
  return {
    sales: items.map((sale) => mapSale(sale, Number(sale.item_count ?? 0))),
    total,
  }
}

export const getSaleDetail = async (saleId: number): Promise<SaleDetail> => {
  const sale = await apiRequest<SaleDetailResource>(`/api/sales/${saleId}`)
  return mapSaleDetail(sale)
}
