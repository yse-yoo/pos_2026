import { apiRequest } from '../../lib/api/client'
import type { SaleDetail } from '../../types/sale'
import type { PendingCheckout } from '../hooks/CheckoutContext'

type SaleDetailResource = {
  id: number
  receipt_number: string
  sold_at: string
  subtotal: number
  tax_total: number
  total: number
  payment_method: string
  cash_received: number | null
  change_amount: number | null
  status: string
  items: Array<{
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

type CheckoutRequestResource = {
  id: string
  status: PendingCheckout['status']
  payment_method: PendingCheckout['paymentMethod']
  order_type: PendingCheckout['orderType']
  tax_rate: number
  subtotal: number
  tax_total: number
  total: number
  items: Array<{
    id?: number
    product_id?: number
    name?: string
    price?: number
    quantity: number
  }>
  sale_id: number | null
  sale: SaleDetailResource | null
  created_at: string
}

const mapSaleDetail = (sale: SaleDetailResource): SaleDetail => ({
  id: Number(sale.id),
  receiptNumber: sale.receipt_number,
  soldAt: sale.sold_at,
  itemCount: sale.items.reduce((sum, item) => sum + Number(item.quantity), 0),
  totalAmount: Number(sale.total),
  paymentMethod: sale.payment_method,
  subtotal: Number(sale.subtotal),
  taxTotal: Number(sale.tax_total),
  cashReceived: sale.cash_received === null ? null : Number(sale.cash_received),
  changeAmount: sale.change_amount === null ? null : Number(sale.change_amount),
  status: sale.status,
  items: sale.items.map((item) => ({
    id: Number(item.id),
    productName: item.product_name,
    categoryName: item.category_name ?? '',
    unitPrice: Number(item.unit_price),
    quantity: Number(item.quantity),
    taxRate: Number(item.tax_rate),
    taxAmount: Number(item.tax_amount),
    subtotal: Number(item.subtotal),
    total: Number(item.total),
  })),
})

const mapCheckoutRequest = (request: CheckoutRequestResource): PendingCheckout => ({
  id: request.id,
  status: request.status,
  items: request.items.map((item) => ({
    id: Number(item.id ?? item.product_id),
    name: item.name ?? `商品ID ${item.product_id ?? item.id}`,
    price: Number(item.price ?? 0),
    category: 'フード',
    icon: '・',
    imagePath: '',
    isActive: true,
    quantity: Number(item.quantity),
  })),
  paymentMethod: request.payment_method,
  orderType: request.order_type,
  taxRatePercent: Number(request.tax_rate),
  subtotal: Number(request.subtotal),
  tax: Number(request.tax_total),
  total: Number(request.total),
  saleId: request.sale_id,
  sale: request.sale ? mapSaleDetail(request.sale) : null,
  createdAt: request.created_at,
})

const toCheckoutRequestBody = (checkout: Omit<PendingCheckout, 'id' | 'status' | 'saleId' | 'sale' | 'createdAt'>) => ({
  payment_method: checkout.paymentMethod,
  order_type: checkout.orderType,
  tax_rate: checkout.taxRatePercent,
  subtotal: checkout.subtotal,
  tax_total: checkout.tax,
  total: checkout.total,
  items: checkout.items.map((item) => ({
    id: item.id,
    product_id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  })),
})

export const createCheckoutRequest = async (
  checkout: Omit<PendingCheckout, 'id' | 'status' | 'saleId' | 'sale' | 'createdAt'>,
): Promise<PendingCheckout> => {
  const request = await apiRequest<CheckoutRequestResource>('/api/checkout-requests', {
    method: 'POST',
    body: JSON.stringify(toCheckoutRequestBody(checkout)),
  })
  return mapCheckoutRequest(request)
}

export const getCurrentCheckoutRequest = async (): Promise<PendingCheckout | null> => {
  const request = await apiRequest<CheckoutRequestResource | null>('/api/checkout-requests/current')
  return request ? mapCheckoutRequest(request) : null
}

export const getCheckoutRequest = async (checkoutRequestId: string): Promise<PendingCheckout> => {
  const request = await apiRequest<CheckoutRequestResource>(`/api/checkout-requests/${checkoutRequestId}`)
  return mapCheckoutRequest(request)
}

export const completeCheckoutRequest = async (checkoutRequestId: string): Promise<PendingCheckout> => {
  const request = await apiRequest<CheckoutRequestResource>(`/api/checkout-requests/${checkoutRequestId}/complete`, {
    method: 'POST',
  })
  return mapCheckoutRequest(request)
}

export const cancelCheckoutRequest = async (checkoutRequestId: string): Promise<PendingCheckout> => {
  const request = await apiRequest<CheckoutRequestResource>(`/api/checkout-requests/${checkoutRequestId}`, {
    method: 'DELETE',
  })
  return mapCheckoutRequest(request)
}
